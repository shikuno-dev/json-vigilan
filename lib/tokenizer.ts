import { 
  Token, 
  TokenType,
} from "./types";
import { 
  BEGIN_ARRAY, 
  BEGIN_OBJECT, 
  END_ARRAY, 
  END_OBJECT, 
  QUOTATION_MARK,
  WHITESPACE_REGEX,
  VALUE_SEPARATOR, 
  ERROR_MESSAGES,
} from "./utils";
import {
  popUntilMatchedBracketFromStack, 
  updateKeyStack,
  isExpectingToken, 
  isStructuralCharacter, 
  isValidString,
  isKey,
  isKeyUnique,
  isValidNumberString,
  isValidLiteralName,
} from "./validator";


export function _tokenize(jsonText: string): Token[]{  
  let tokens: Token[] = []; 
  let i = 0;
  let line = 0;
  let column = 0;
  let leftBracketStack: Token[] = [];
  let keyStack: string[][] = [];

  while (i < jsonText.length) {
    const CHAR: string = jsonText[i];
    const PREV_TOKEN = tokens[tokens.length-1];

    if (isStructuralCharacter(CHAR)) {
      let currentToken: Token = { type: TokenType.StructuralCharacter, value: CHAR, index: i, position: {line, column}, isValid: true };
      let result = isExpectingToken(currentToken, PREV_TOKEN, leftBracketStack);

      if (!result.isValid) {
        currentToken.isValid = false;
        currentToken.message = result.message;
      }

      if (CHAR === BEGIN_ARRAY || CHAR === BEGIN_OBJECT) {
        leftBracketStack.push(currentToken);
        currentToken.depth = leftBracketStack.length;
      } else if (CHAR === END_ARRAY || CHAR === END_OBJECT) {
        if (PREV_TOKEN.type === TokenType.StructuralCharacter && PREV_TOKEN.value === VALUE_SEPARATOR) {
          PREV_TOKEN.isValid = false;
          PREV_TOKEN.message = ERROR_MESSAGES.TrailingComma;
        }

        const matchedToken = popUntilMatchedBracketFromStack(CHAR, leftBracketStack)

        if (matchedToken) {
          matchedToken.closingLine = line;
          currentToken.depth = matchedToken.depth;
        // } else {
          // If matchedToken===undefined, isExpectingToken.isValid===false.
          // token.isValid = false;
          // token.message = "";
        } 
      }
      
      if (CHAR === BEGIN_OBJECT || CHAR === END_OBJECT) updateKeyStack(CHAR, keyStack); // unique key

      tokens.push(currentToken);
      column++, i++;
    } else if (CHAR === QUOTATION_MARK) { // String
      let string = '';
      const INDEX = i;
      const COLUMN = column;
      i++, column++;

      while (i < jsonText.length && jsonText[i] !== '"') {
        string += jsonText[i];

        if(jsonText[i] === '\\' && jsonText[i+1] === '"') { // For \" (escaped quotes)
          string += jsonText[i+1];
          i++, column++;
        }
        i++, column++;
      }

      let currentToken: Token = { type: TokenType.String, value: string, index: INDEX, position: {line, column: COLUMN}, isValid: true};

      if (jsonText[i] !== QUOTATION_MARK) {
        currentToken.message = ERROR_MESSAGES.UnterminatedString;
        currentToken.isValid = false;
      } else {
        let result = isValidString(string);
        if (!result.isValid){
          currentToken.isValid=false;
          currentToken.message= result.message;
        }else{
          // Key must be a valid string
          if (isKey(PREV_TOKEN, leftBracketStack)) {
            currentToken.type = TokenType.Key

            if (!isKeyUnique(string, keyStack)) {
              currentToken.isValid = false;
              currentToken.message = ERROR_MESSAGES.DuplicateObjectKey;

              for (let i = tokens.length - 1; i >= 0; i--) {
                const token = tokens[i];

                if (token.type === TokenType.StructuralCharacter && token.value === BEGIN_OBJECT) {
                  break; 
                }
                if (token.type === TokenType.Key && token.value === string) {
                  token.isValid = false;
                  token.message = ERROR_MESSAGES.DuplicateObjectKey;
                }
              }

            } else {
              keyStack[keyStack.length-1].push(string);
            }
            // If isKey is true, isExpectingToken.isValid is true, so isExpectingToken Function is not executed.
          } else {
            let result = isExpectingToken(currentToken, PREV_TOKEN, leftBracketStack);
            if (!result.isValid) {
              currentToken.isValid = false;
              currentToken.message = result.message;
            }
          }
        }
      }
      tokens.push(currentToken)
      i++, column++;

    } else if (/[0-9-]/.test(CHAR)) { // Number
      let number = '';
      const INDEX = i;
      const COLUMN = column;

      while (i < jsonText.length && /[0-9.eE+-]/.test(jsonText[i])) {
        number += jsonText[i];
        column++;
        i++;
      }

      let currentToken: Token = { type: TokenType.Number, value: number, index: INDEX, position: {line, column: COLUMN}, isValid: true };

      if (!isValidNumberString(number)) {
        currentToken.isValid = false;
        currentToken.message = ERROR_MESSAGES.InvalidNumber;
      // } else {
        // if (!isInteroperableNumberString(number)) token.message = 'potentially interoperable problem'
      }
      
      let result = isExpectingToken(currentToken, PREV_TOKEN, leftBracketStack);

      if (!result.isValid) {
        currentToken.isValid = false;
        currentToken.message = result.message;
      }

      tokens.push(currentToken)
    } else if (/[a-zA-Z]/.test(CHAR)) { // Literal Name
      let name = '';
      const INDEX = i;
      const COLUMN = column;

      while (i < jsonText.length && /[a-zA-Z]/.test(jsonText[i])) {
        name += jsonText[i];
        column++, i++;
      }

      let currentToken: Token = { type: TokenType.LiteralName, value: name, index: INDEX, position: {line, column: COLUMN}, isValid: true };

      if (!isValidLiteralName(name)) {
        currentToken.type = TokenType.Unexpected;
        currentToken.isValid = false;
        currentToken.message = ERROR_MESSAGES.UnexpectedLiteralName;
      }

      let result = isExpectingToken(currentToken, PREV_TOKEN, leftBracketStack);
      if (!result.isValid) {
        currentToken.isValid = false;
        currentToken.message = result.message;
      }

      tokens.push(currentToken);

    } else if (WHITESPACE_REGEX.test(CHAR)) { // " " "\t" "\n"  "\r"
      column++, i++; // Skip whitespace (Space, Horizontal tab, Line feed or New line, Carriage return

      if(CHAR === '\r') {
        // \r\n 
        if(jsonText[i+1] === '\n') i++
        line++, column=0;
      }else if(CHAR === '\n') {
        line++, column=0;
      }
    } else {
      if(
        PREV_TOKEN?.type === TokenType.Unexpected && 
        PREV_TOKEN.position.line === line && 
        PREV_TOKEN.index+1 === i // Whitespace
      ) {
        tokens[tokens.length-1].value+=CHAR
        tokens[tokens.length-1].position.column++
      } else {
        let currentToken: Token = { type: TokenType.Unexpected, value: CHAR, index: i, position: {line, column},  message: ERROR_MESSAGES.UnexpectedCharacter, isValid: false };

        let result = isExpectingToken(currentToken, PREV_TOKEN, leftBracketStack);
        if (!result.isValid) currentToken.message = result.message;

        tokens.push(currentToken);
      }
      column++, i++;
    }
  }

  for (let i = 0; i < leftBracketStack.length; i++){
    if(leftBracketStack[i].isValid){
      leftBracketStack[i].isValid = false;
      leftBracketStack[i].message= ERROR_MESSAGES.UnterminatedBracket;
    }
  }
  
  return tokens;
}