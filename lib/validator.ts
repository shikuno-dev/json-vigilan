import { 
  EndBracket, 
  Token, 
  TokenType,
} from "./types";
import { 
  BEGIN_ARRAY, 
  BEGIN_OBJECT, 
  END_ARRAY, 
  END_OBJECT, 
  NAME_SEPARATOR, 
  VALUE_SEPARATOR, 
  ERROR_MESSAGES,
} from "./utils";

export function isStructuralCharacter(char: string): boolean {
  return (
    char === BEGIN_ARRAY || char === BEGIN_OBJECT || 
    char === END_ARRAY || char === END_OBJECT || 
    char === VALUE_SEPARATOR || char === NAME_SEPARATOR
  )
}

function isBeginArrayOrObjectType(tokenType: TokenType, tokenValue: string): boolean {
  return tokenType === TokenType.StructuralCharacter && (tokenValue === BEGIN_ARRAY ||  tokenValue === BEGIN_OBJECT )
}

// four primitive types (strings, numbers, booleans, and null) 
function isPrimitiveType(tokenType: number): boolean {
  return tokenType === TokenType.String || tokenType === TokenType.Number || tokenType === TokenType.LiteralName;
}

// unescaped = %x20-21 / %x23-5B / %x5D-10FFFF
function isUnescaped(char: string): boolean {
  if(char.length !== 1) return false;

  const codePoint = char.codePointAt(0);

  if(codePoint === undefined) return false;
  // 0x22 is "   0x5C is \
  return (codePoint >= 0x20 && codePoint <= 0x21) ||
         (codePoint >= 0x23 && codePoint <= 0x5B) ||
         (codePoint >= 0x5D && codePoint <= 0x10FFFF);
}

export function isValidString(string: string): {
  isValid: boolean;
  message: string;
} {
  let isValid: boolean = true;
  let message: string = "";

  for (let i = 0; i < string.length; i++) {
      const char = string[i];

      if (char === '\\') {
        if (
          string[i+1] === '"' || // quotation mark
          string[i+1] === '\\' || // reverse solidus
          string[i+1] === '/' || // solidus
          string[i+1] === 'b' || // backspace
          string[i+1] === 'f' || // form feed 
          string[i+1] === 'n' || // line feed
          string[i+1] === 'r' || // carriage return
          string[i+1] === 't' // tab 
        ) {
          i++; // Skip next character
        } else if ( string[i+1] === 'u' ){ // \uXXXX
          if (
            /^[0-9A-Fa-f]$/.test(string[i+2]) &&
            /^[0-9A-Fa-f]$/.test(string[i+3]) &&
            /^[0-9A-Fa-f]$/.test(string[i+4]) &&
            /^[0-9A-Fa-f]$/.test(string[i+5])
          ) {
            i+=6; // The hexadecimal letters A through F can be uppercase or lowercase. 
          } else {
            isValid = false;
            message = ERROR_MESSAGES.BadUnicodeEscape;
          }
        } else {
          // Bad escaped character
          isValid = false;
          message = ERROR_MESSAGES.BadUnicodeEscape;
        }
      } else if (!isUnescaped(char)) {
        isValid = false;
        message = ERROR_MESSAGES.BadControlCharacter;
      }
  }

  return {isValid, message}
}

export function isValidNumberString(str: string): boolean {
  const numberRegex = /^-?(0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?$/;
  return numberRegex.test(str);
}
// export function isInteroperableNumberString(number: string): boolean {
//   // 3.141592653589793238462643383279　--> 3.141592653589793
//   // 1E400 --> Infinity
//   return Number.isFinite( Number(number) ) && !Number.isNaN(Number(number));
// }

export function isValidLiteralName(name: string): boolean {
  return name === 'true' || name === 'false' || name === 'null';
}

export function popUntilMatchedBracketFromStack(bracket: EndBracket, startBracketStack: Token[]): Token | undefined {
  const stackLength = startBracketStack.length;
  let foundIndex = -1;

  if (bracket === ']') {
    for (let i = stackLength - 1; i >= 0; i--) {
      if (startBracketStack[i].value === '[') {
        foundIndex = i;
        break;
      }
    }
  } else if (bracket === '}') {
    for (let i = stackLength - 1; i >= 0; i--) {
      if (startBracketStack[i].value === '{') {
        foundIndex = i;
        break;
      }
    }
  }
  // If opening bracket are found
  if (foundIndex !== -1) {
      // Pop all tokens after the opening bracket
      startBracketStack.splice(foundIndex + 1);
      // pop the opening bracket 
      return startBracketStack.pop();
  }

  return undefined;
}

// Key
export function isKey(prevToken: Token | undefined, leftBracketStack: Token[] ): boolean{
  if (!prevToken) return false;
  if (leftBracketStack.length === 0 ) return false;

  if (leftBracketStack[leftBracketStack.length-1].value === "{") {
    if (prevToken.value === "{" || prevToken.value === ",") return true;
  }
  return false;
}
export function isKeyUnique(key: string, keyStack: string[][]): boolean {
  const allKeys = keyStack[keyStack.length-1];
  return !allKeys.includes(key);
}
export function updateKeyStack(symbol: string, keyStack: string[][]) {
  if (symbol === '{') keyStack.push([]); // Create a new scope when symbol is {
  else if (symbol === '}') keyStack.pop(); // Removes the current scope when symbol is }
}

// From the leftBracketStack and the previous token, then determine if the current token is the expected token.
// Only available in **_tokenize** function
export function isExpectingToken(currentToken: Token, prevToken: Token | undefined, leftBracketStack: Token[]): {
  isValid: boolean;
  message: string;
} {
  let isValid: boolean = true;
  let message: string = "";

  if (!prevToken) { // tokens.length===0
    if ( !(isPrimitiveType(currentToken.type) || isBeginArrayOrObjectType(currentToken.type, currentToken.value))) {
      // Override message even if currentToken.type is Unexpected
      isValid = false;
      // message = "Requires a JSON object, array, or literal.";
      message = ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '['"
      // message = ERROR_MESSAGES.UnexpectedToken + ""
    }
  } else if (leftBracketStack.length === 0) { // prevToken!==undefined
      // If prevToken exists and leftBracketStack.length is 0, any token is invalid
      isValid = false;
      message = ERROR_MESSAGES.NotEOF;
  } else { // prevToken!==undefined && leftBracketStack.length>0
    if (prevToken.type===TokenType.StructuralCharacter) {
      // Already confirmed that leftBracketStack.length>0
      let lastBracket: Token = leftBracketStack[leftBracketStack.length-1];

      if (prevToken.value === END_ARRAY || prevToken.value === END_OBJECT) {
        if (lastBracket.value === BEGIN_ARRAY) { // in []
          if( !( currentToken.type === TokenType.StructuralCharacter && (currentToken.value === VALUE_SEPARATOR ||  currentToken.value === END_ARRAY) ) ) {
            isValid = false;
            message = ERROR_MESSAGES.UnexpectedToken + "',', ']'";
          }
        } else if (lastBracket.value === BEGIN_OBJECT){ // in {}
          if ( !( currentToken.type === TokenType.StructuralCharacter && (currentToken.value === VALUE_SEPARATOR || currentToken.value === END_OBJECT) ) ) {
            isValid = false;
            message = ERROR_MESSAGES.UnexpectedToken + "',', '}'";
          }
        }
      } else if(prevToken.value===BEGIN_ARRAY) { // lastBracket.value should be BEGIN_ARRAY
        if (
          !(
            (currentToken.type === TokenType.StructuralCharacter && currentToken.value === BEGIN_OBJECT) || 
            (currentToken.type === TokenType.StructuralCharacter && currentToken.value === BEGIN_ARRAY) || 
            (currentToken.type === TokenType.StructuralCharacter && currentToken.value === END_ARRAY) || 
            isPrimitiveType(currentToken.type)
          )
        ) {
          isValid = false;
          message = ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '[', ']''";
        }
      } else if(prevToken.value === BEGIN_OBJECT) { // lastBracket.value should be BEGIN_OBJECT
        if ( !(currentToken.type === TokenType.Key || (currentToken.type === TokenType.StructuralCharacter && currentToken.value === END_OBJECT) ) ) {
          isValid = false;

          if ( currentToken.type === TokenType.Number || currentToken.type === TokenType.LiteralName || currentToken.type === TokenType.Unexpected  ) {
            message = ERROR_MESSAGES.UnenclosedKey;
          } else {
            message = ERROR_MESSAGES.UnexpectedToken + "'KEY', '}'";
          }
        }
      } else if(prevToken.value === VALUE_SEPARATOR) { // ,
        // Whether or not the prevToken is a trailing comma is determined by the **_tokenize** function.

        if (lastBracket?.value === BEGIN_ARRAY) { // in []
          if (
            currentToken.type === TokenType.StructuralCharacter && 
            (currentToken.value === END_OBJECT || currentToken.value === VALUE_SEPARATOR || currentToken.value === NAME_SEPARATOR)
            // Assumption that currentToken.type===TokenType.Key does not exist in []. (determined by **_tokenize** function)
          ) {
            isValid = false;
            message = ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '['";
          }
        } else if (lastBracket?.value===BEGIN_OBJECT){ // in {}
          if (
            currentToken.type !== TokenType.Key && 
            // trailing comma `,]` || `,}` --> Set isValid of prevToken to false instead of currentToken in tokenize Function
            !(currentToken.type === TokenType.StructuralCharacter && currentToken.value === END_ARRAY) &&
            !(currentToken.type === TokenType.StructuralCharacter && currentToken.value === END_OBJECT)
          ) {
            isValid = false;
            if ( currentToken.type === TokenType.Number || currentToken.type === TokenType.LiteralName || currentToken.type === TokenType.Unexpected  ) {
              message = ERROR_MESSAGES.UnenclosedKey;
            } else {
              message = ERROR_MESSAGES.UnexpectedToken + "'KEY'";
            }
          }
        }
      } else if(prevToken.value === NAME_SEPARATOR) { // :
        if (currentToken.type === TokenType.StructuralCharacter && 
          (currentToken.value === END_ARRAY || currentToken.value === END_OBJECT || 
            currentToken.value === VALUE_SEPARATOR || currentToken.value === NAME_SEPARATOR)
        ) {
          isValid = false;
          message = ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '['";
        }
      }
    } else if (prevToken.type === TokenType.Key) {
      if ( !(currentToken.type === TokenType.StructuralCharacter && currentToken.value === NAME_SEPARATOR) ) {
        isValid = false;
        message = ERROR_MESSAGES.UnexpectedToken + "':'";
      }
    } else if (isPrimitiveType(prevToken.type) ||  prevToken.type === TokenType.Unexpected) {
      let lastBracket: Token | undefined = leftBracketStack[leftBracketStack.length-1];
      
      if(lastBracket.value===BEGIN_ARRAY) { // in []
        if ( !( currentToken.type === TokenType.StructuralCharacter && (currentToken.value === VALUE_SEPARATOR ||  currentToken.value === END_ARRAY)) ) {
          isValid = false;
          message = ERROR_MESSAGES.UnexpectedToken + "',', ']'";
        }
      }else if (lastBracket.value === BEGIN_OBJECT){ // in {}
       
        if ( !( currentToken.type === TokenType.StructuralCharacter && (currentToken.value === VALUE_SEPARATOR || currentToken.value === END_OBJECT) )) {
          if (
            // Ensure that prevToken is not in a key position
            !(
              (prevToken.type === TokenType.Number || prevToken.type === TokenType.LiteralName || prevToken.type === TokenType.Unexpected) && 
              currentToken.type === TokenType.StructuralCharacter && currentToken.value === NAME_SEPARATOR
            )
          ) { 
            isValid = false;
            message = ERROR_MESSAGES.UnexpectedToken + "',', '}'";
          }
        }
      }
    } else {
      throw new Error("Type of Token should be 'StructuralCharacter', 'String', 'Number', 'Literalname', 'Key' or 'Unexpected'");
    }
  }

  return { isValid, message };
}