import { _tokenize } from "./tokenizer";
import { Token, TokenType } from "./types";
import { 
  BEGIN_ARRAY, 
  BEGIN_OBJECT, 
  END_ARRAY, END_OBJECT, 
  ERROR_MESSAGES, QUOTATION_MARK, 
  VALUE_SEPARATOR, 
  normalizeNewlines 
} from "./utils";

export function _prettify(jsonText: string, indentation: string = '\t') {
  jsonText = normalizeNewlines(jsonText);

  let tokens: Token[] = _tokenize(jsonText);

  let output = '';
  let currentIndentation = '';
  
  for (const token of tokens) {
    let { type, value, isValid, position, message } = token;

    if (!isValid) {
      if(type === TokenType.String && message === ERROR_MESSAGES.BadControlCharacter) {
        value = '"' + value;
      }
      output = `Parse error on line ${position.line+1}, column ${position.column+1}: \n${value}\n^\n${message}`;
      break
    }
    
    if (type === TokenType.StructuralCharacter) {
      if (value === BEGIN_ARRAY || value === BEGIN_OBJECT) {
        output += value + '\n';
        currentIndentation += indentation;
        output += currentIndentation;
      } else if (value === END_ARRAY|| value === END_OBJECT) {
        currentIndentation = currentIndentation.slice(0, -indentation.length);
        output = output.trimEnd() + '\n' + currentIndentation + value;
      } else if(value === VALUE_SEPARATOR) {
        output += value+'\n'+currentIndentation;
      } else { // : ,
        output += value+' ';
      }
    } else if (type === TokenType.String || type === TokenType.Key) {
      output += QUOTATION_MARK+ value + QUOTATION_MARK;
    } else if (type === TokenType.Number || type === TokenType.LiteralName) {
      output += value;
    } else if (type === TokenType.Unexpected) {
      output += value;
    }    
  }
  
  return output;
}