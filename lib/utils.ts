// 6 structural characters
export const BEGIN_ARRAY = '[';
export const BEGIN_OBJECT = '{';
export const END_ARRAY = ']';
export const END_OBJECT = '}';
export const VALUE_SEPARATOR = ',';
export const NAME_SEPARATOR = ':';
// Quotation mark
export const QUOTATION_MARK = '"';
// whitespase: `space` | `Horizontal tab` | `Line feed or New line` | `Carriage return`
export const WHITESPACE_REGEX = /[ \t\n\r]/;

// normalize
export function normalizeNewlines(text: string): string {
  return text.replace(/\r?\n/g, '\n').replace(/\r/g, '\n');
}

export const ERROR_MESSAGES = {
  TrailingComma: 'Trailing comma is not allowed', // [ "value", ] | { "key", "value", } 
  UnterminatedString: 'Unterminated string found', // "text
  DuplicateObjectKey: 'Duplicate object key found', //  { "key1", "value1", "key1", "value2" } 
  InvalidNumber: 'Invalid number format', // .1
  UnexpectedLiteralName: 'Unexpected literal name encountered', // True | Invalid
  UnexpectedCharacter: 'Unexpected character encountered', // ?
  UnterminatedBracket: 'Unterminated bracket found', // [ "value" | { "key", "value"  
  BadUnicodeEscape: 'Invalid Unicode escape found in string', // \uGGGG | 
  BadControlCharacter : 'Invalid control character found in string', // \n | " | \ 
  NotEOF:  'End of file expected', // [], | {}a
  UnexpectedToken: 'Expecting a ',
  UnenclosedKey: 'Keys must be enclosed in double quotes' // {"key :""}
}