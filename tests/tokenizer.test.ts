import { expect, test } from 'vitest';
import { _tokenize } from '../lib/tokenizer';
import { Token, TokenType } from '../lib/types';
import { ERROR_MESSAGES } from '../lib/utils';

// Empty
test('Empty JSON Text', () => {
  expect(_tokenize('')).toStrictEqual([]);
})


// Primitive
test('Valid Primitive', () => {
  expect(_tokenize('"string"')).toStrictEqual([
    { type: TokenType.String, value: 'string', index: 0, position: { line: 0, column: 0 }, isValid: true }
  ]);
  expect(_tokenize('" str ing "')).toStrictEqual([
    // String contains whitespace characters
    { type: TokenType.String, value: ' str ing ', index: 0, position: { line: 0, column: 0 }, isValid: true }
  ]);
  expect(_tokenize('"hello\\"world"')).toStrictEqual([
    { type: TokenType.String, value: 'hello\\"world', index: 0, position: { line: 0, column: 0 }, isValid: true }
  ]);
  expect(_tokenize('"hello\\nworld"')).toStrictEqual([
    // Escaped characters: \n
    { type: TokenType.String, value: 'hello\\nworld', index: 0, position: { line: 0, column: 0 }, isValid: true }
  ]);
  expect(_tokenize('"hello\\u0001world"')).toStrictEqual([
    { type: TokenType.String, value: 'hello\\u0001world', index: 0, position: { line: 0, column: 0 }, isValid: true }
  ]);

  expect(_tokenize('123')).toStrictEqual([ // Numeric
    { type: TokenType.Number, value: '123', index: 0, position: { line: 0, column: 0 }, isValid: true }
  ]);
  expect(_tokenize('1.3')).toStrictEqual([ // Decimal digit
    { type: TokenType.Number, value: '1.3', index: 0, position: { line: 0, column: 0 }, isValid: true }
  ]);
  expect(_tokenize('1e3')).toStrictEqual([ // Exponent
    { type: TokenType.Number, value: '1e3', index: 0, position: { line: 0, column: 0 }, isValid: true }
  ])
  expect(_tokenize('1.2e3')).toStrictEqual([ // Decimal digit && Exponent
    { type: TokenType.Number, value: '1.2e3', index: 0, position: { line: 0, column: 0 }, isValid: true }
  ])
  expect(_tokenize('-13')).toStrictEqual([ // Negative value
    { type: TokenType.Number, value: '-13', index: 0, position: { line: 0, column: 0}, isValid: true }
  ])
  expect(_tokenize('-1.2e3')).toStrictEqual([ // Negative && Decimal digit && Exponent
    { type: TokenType.Number, value: '-1.2e3', index: 0, position: { line: 0, column: 0 }, isValid: true }
  ])
  expect(_tokenize('true')).toStrictEqual([
    { type: TokenType.LiteralName, value: 'true', index: 0, position: { line: 0, column: 0 }, isValid: true }
  ]);
  expect(_tokenize('false')).toStrictEqual([
    { type: TokenType.LiteralName, value: 'false', index: 0, position: { line: 0, column: 0 }, isValid: true }
  ]);
  expect(_tokenize('null')).toStrictEqual([
    { type: TokenType.LiteralName, value: 'null', index: 0, position: { line: 0, column: 0 }, isValid: true }
  ]);
})

test('Invalid Primitive', () => {
  expect(_tokenize('"hello\nworld"')).toStrictEqual([ // Include control characters
    { type: TokenType.String, value: 'hello\nworld', index: 0, position: { line: 0, column: 0 }, isValid: false, message: ERROR_MESSAGES.BadControlCharacter }
  ]);
  expect(_tokenize('"hello\u0000world"')).toStrictEqual([ // Include invalid escape characters
    { type: TokenType.String, value: 'hello\u0000world', index: 0, position: { line: 0, column: 0 }, isValid: false, message: ERROR_MESSAGES.BadControlCharacter }
  ]);
  expect(_tokenize('"string')).toStrictEqual([ // // Unterminated string
    { type: TokenType.String, value: 'string', index: 0, position: { line: 0, column: 0 }, isValid: false, message: ERROR_MESSAGES.UnterminatedString }
  ]);
  expect(_tokenize('123abc')).toStrictEqual([ // Numeric followed by a character
    { type: TokenType.Number, value: '123', index: 0, position: { line: 0, column: 0 }, isValid: true },
    { type: TokenType.Unexpected, value: 'abc', index: 3, position: { line: 0, column: 3 }, isValid: false, message: ERROR_MESSAGES.NotEOF },
  ]);
  expect(_tokenize('123[')).toStrictEqual([ // Numeric followed by a Structural character
    { type: TokenType.Number, value: '123', index: 0, position: { line: 0, column: 0 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: '[', index: 3, position: { line: 0, column: 3 }, isValid: false, message: ERROR_MESSAGES.NotEOF, depth: 1 },
  ]);

  let expectedMessage = ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '['";

  expect(_tokenize('Invalid')).toStrictEqual([ // Contains literal names other than true, false, or null
    { type: TokenType.Unexpected, value: 'Invalid', index: 0, position: { line: 0, column: 0 }, isValid: false, message: expectedMessage}
  ]);
  expect(_tokenize('False')).toStrictEqual([ // Literal names containing uppercase letters
    { type: TokenType.Unexpected, value: 'False', index: 0, position: { line: 0, column: 0 }, isValid: false, message: expectedMessage}
  ]);
  expect(_tokenize('?')).toStrictEqual([
  { type: TokenType.Unexpected, value: '?', index: 0, position: { line: 0, column: 0 }, isValid: false, message:expectedMessage }
]);
})


// Array, Object
// Valid
test('Empty Object', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '{', index: 0, position: { line: 0, column: 0 }, isValid: true, depth: 1, closingLine: 0
    },
    { type: TokenType.StructuralCharacter, value: '}', index: 1, position: { line: 0, column: 1 }, isValid: true, depth: 1}
  ];
  expect(_tokenize('{}')).toStrictEqual(ExpectedTokens);
})

test('Empty Array', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '[', index: 0, position: { line: 0, column: 0 }, isValid: true, depth: 1, closingLine: 0 },
    { type: TokenType.StructuralCharacter, value: ']', index: 1, position: { line: 0, column: 1 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize('[]')).toStrictEqual(ExpectedTokens);
})

test('Simple Array', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '[', index: 0, position: { line: 0, column: 0 }, isValid: true, depth: 1, closingLine: 0 },
    { type: TokenType.String, value: 'hello', index: 1, position: { line: 0, column: 1 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ']', index: 8, position: { line: 0, column: 8 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize('["hello"]')).toStrictEqual(ExpectedTokens);
})

test('Multiple Value in an Array', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '[', index: 0, position: { line: 0, column: 0 }, isValid: true, depth: 1, closingLine: 0 },
    { type: TokenType.String, value: 'hello', index: 1, position: { line: 0, column: 1 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 8, position: { line: 0, column: 8 }, isValid: true },
    { type: TokenType.String, value: 'world', index: 10, position: { line: 0, column: 10 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 17, position: { line: 0, column: 17 }, isValid: true },
    { type: TokenType.Number, value: '10', index: 19, position: { line: 0, column: 19 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 21, position: { line: 0, column: 21 }, isValid: true },
    { type: TokenType.LiteralName, value: 'true', index: 23, position: { line: 0, column: 23 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ']', index: 27, position: { line: 0, column: 27 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize('["hello", "world", 10, true]')).toStrictEqual(ExpectedTokens);
})

test('Nested JSON objects', () => {
  const jsonText = `[\n  ["value1", "value2"]\n]`;
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '[', index: 0, position: { line: 0, column: 0 }, isValid: true, closingLine: 2, depth: 1 },
    { type: TokenType.StructuralCharacter, value: '[', index: 4, position: { line: 1, column: 2 }, isValid: true, closingLine: 1, depth: 2 },
    { type: TokenType.String, value: 'value1', index: 5, position: { line: 1, column: 3 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 13, position: { line: 1, column: 11 }, isValid: true },

    { type: TokenType.String, value: 'value2', index: 15, position: { line: 1, column: 13 }, isValid: true },

    { type: TokenType.StructuralCharacter, value: ']', index: 23, position: { line: 1, column: 21 }, isValid: true, depth: 2 },
    { type: TokenType.StructuralCharacter, value: ']', index: 25, position: { line: 2, column: 0 }, isValid: true, depth: 1 }

  ];
  expect(_tokenize(jsonText)).toStrictEqual(ExpectedTokens);
  
})

test('Simple Object', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '{', index: 0, position: { line: 0, column: 0 }, isValid: true, depth: 1, closingLine: 0 },
    { type: TokenType.Key, value: 'key', index: 2, position: { line: 0, column: 2 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 7, position: { line: 0, column: 7 }, isValid: true },
    { type: TokenType.String, value: 'value', index: 9, position: { line: 0, column: 9 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: '}', index: 17, position: { line: 0, column: 17 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize('{ "key": "value" }')).toStrictEqual(ExpectedTokens);
})
test('Multiple Keys in an Object', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '{', index: 0, position: { line: 0, column: 0 }, isValid: true, depth: 1, closingLine: 0 },
    { type: TokenType.Key, value: 'key1', index: 2, position: { line: 0, column: 2 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 8, position: { line: 0, column: 8 }, isValid: true },
    { type: TokenType.String, value: 'value', index: 10, position: { line: 0, column: 10 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 17, position: { line: 0, column: 17 }, isValid: true },
    { type: TokenType.Key, value: "key2", index: 19, position: { line: 0, column: 19 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 25, position: { line: 0, column: 25 }, isValid: true  },
    { type: TokenType.String, value: 'value', index: 27, position: { line: 0, column:  27}, isValid: true },
    { type: TokenType.StructuralCharacter, value: '}', index: 35, position: { line: 0, column: 35 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize('{ "key1": "value", "key2": "value" }')).toStrictEqual(ExpectedTokens);
})

test('Nested JSON objects', () => {
  const jsonText = `{\n"key1": {\n"nested_key1": "value1",\n"nested_key2": "value2"\n}\n}`;
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '{', index: 0, position: { line: 0, column: 0 }, isValid: true, closingLine: 5, depth: 1 },
    { type: TokenType.Key, value: 'key1', index: 2, position: { line: 1, column: 0 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 8, position: { line: 1, column: 6 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: '{', index: 10, position: { line: 1, column: 8 }, isValid: true, closingLine: 4, depth: 2},

    { type: TokenType.Key, value: 'nested_key1', index: 12, position: { line: 2, column: 0 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 25, position: { line: 2, column: 13 }, isValid: true },
    { type: TokenType.String, value: 'value1', index: 27, position: { line: 2, column: 15 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 35, position: { line: 2, column: 23 }, isValid: true },

    { type: TokenType.Key, value: 'nested_key2', index: 37, position: { line: 3, column: 0 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 50, position: { line: 3, column: 13 }, isValid: true },
    { type: TokenType.String, value: 'value2', index: 52, position: { line: 3, column: 15 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: '}', index: 61, position: { line: 4, column: 0 }, isValid: true, depth: 2},

    { type: TokenType.StructuralCharacter, value: '}', index: 63, position: { line: 5, column: 0 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize(jsonText)).toStrictEqual(ExpectedTokens);
})

// Invalid
test('Invalid Value in an Array', () => { 
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '[', index: 0, position: { line: 0, column: 0 }, isValid: true, depth: 1, closingLine: 0 },
    { type: TokenType.String, value: 'hello', index: 1, position: { line: 0, column: 1 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 8, position: { line: 0, column: 8 }, isValid: true },
    { type: TokenType.Number, value: '-12.3E4', index: 10, position: { line: 0, column: 10 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 17, position: { line: 0, column: 17 }, isValid: true },
    { type: TokenType.Unexpected, value: '??', index: 19, position: { line: 0, column: 20 }, isValid: false, message: ERROR_MESSAGES.UnexpectedCharacter },
    { type: TokenType.StructuralCharacter, value: ',', index: 21, position: { line: 0, column: 21 }, isValid: true },
    { type: TokenType.Unexpected, value: 'Invalid', index: 23, position: { line: 0, column: 23 }, isValid: false, message: ERROR_MESSAGES.UnexpectedLiteralName },
    { type: TokenType.StructuralCharacter, value: ']', index: 30, position: { line: 0, column: 30 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize('["hello", -12.3E4, ??, Invalid]')).toStrictEqual(ExpectedTokens);
})

test('Contains an array that is not properly closed', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '[', index: 0, position: { line: 0, column: 0 }, isValid: false, depth: 1, message: ERROR_MESSAGES.UnterminatedBracket },
    { type: TokenType.String, value: 'hello', index: 1, position: { line: 0, column: 1 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 8, position: { line: 0, column: 8 }, isValid: true },
    { type: TokenType.String, value: 'world', index: 10, position: { line: 0, column: 10 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 17, position: { line: 0, column: 17 }, isValid: true },
    { type: TokenType.Number, value: '10', index: 19, position: { line: 0, column: 19 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 21, position: { line: 0, column: 21 }, isValid: true },
    { type: TokenType.LiteralName, value: 'true', index: 23, position: { line: 0, column: 23 }, isValid: true },
  ];
  expect(_tokenize('["hello", "world", 10, true')).toStrictEqual(ExpectedTokens);
})

test('Contains an object that is not properly closed', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '{', index: 0, position: { line: 0, column: 0 }, isValid: false, depth: 1, message: ERROR_MESSAGES.UnterminatedBracket },
    { type: TokenType.Key, value: 'key1', index: 2, position: { line: 0, column: 2 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 8, position: { line: 0, column: 8 }, isValid: true },
    { type: TokenType.String, value: 'value', index: 10, position: { line: 0, column: 10 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 17, position: { line: 0, column: 17 }, isValid: true },
    { type: TokenType.Key, value: "key2", index: 19, position: { line: 0, column: 19 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 25, position: { line: 0, column: 25 }, isValid: true  },
    { type: TokenType.String, value: 'value', index: 27, position: { line: 0, column:  27}, isValid: true },
  ];
  expect(_tokenize('{ "key1": "value", "key2": "value" ')).toStrictEqual(ExpectedTokens);
})

test('Key is duplicated in an Object', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '{', index: 0, position: { line: 0, column: 0 }, isValid: true, depth: 1, closingLine: 0 },
    { type: TokenType.Key, value: 'key', index: 2, position: { line: 0, column: 2 }, isValid: false, message: ERROR_MESSAGES.DuplicateObjectKey },
    { type: TokenType.StructuralCharacter, value: ':', index: 7, position: { line: 0, column: 7 }, isValid: true },
    { type: TokenType.String, value: 'value', index: 9, position: { line: 0, column: 9 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 16, position: { line: 0, column: 16 }, isValid: true },
    { type: TokenType.Key, value: "key", index: 18, position: { line: 0, column: 18 }, isValid: false, message:ERROR_MESSAGES.DuplicateObjectKey },
    { type: TokenType.StructuralCharacter, value: ':', index: 23, position: { line: 0, column: 23 }, isValid: true  },
    { type: TokenType.String, value: 'value', index: 25, position: { line: 0, column:  25}, isValid: true },
    { type: TokenType.StructuralCharacter, value: '}', index: 33, position: { line: 0, column: 33 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize('{ "key": "value", "key": "value" }')).toStrictEqual(ExpectedTokens);
})

test('Invalid values in an Object', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '{', index: 0, position: { line: 0, column: 0 }, isValid: true, depth: 1, closingLine: 0 },
    { type: TokenType.Key, value: 'key1', index: 2, position: { line: 0, column: 2 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 8, position: { line: 0, column: 8 }, isValid: true },
    { type: TokenType.String, value: 'value', index: 10, position: { line: 0, column: 10 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 17, position: { line: 0, column: 17 }, isValid: true },
    { type: TokenType.Key, value: "key2", index: 19, position: { line: 0, column: 19 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 25, position: { line: 0, column: 25 }, isValid: true  },
    { type: TokenType.Unexpected, value: 'Invalid', index: 27, position: { line: 0, column:  27}, isValid: false, message: ERROR_MESSAGES.UnexpectedLiteralName },
    { type: TokenType.StructuralCharacter, value: '}', index: 35, position: { line: 0, column: 35 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize('{ "key1": "value", "key2": Invalid }')).toStrictEqual(ExpectedTokens);
})

test('Non-string key', () => {
  const jsonText = '{\nkey: "value1",\n123: "value2",\ntrue: "value3"\n}';
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '{', index: 0, position: { line: 0, column: 0 }, isValid: true, closingLine: 4, depth: 1 },
    { type: TokenType.Unexpected, value: 'key', index: 2, position: { line: 1, column:  0}, isValid: false, message: ERROR_MESSAGES.UnenclosedKey },
    { type: TokenType.StructuralCharacter, value: ':', index: 5, position: { line: 1, column: 3 }, isValid: true },
    { type: TokenType.String, value: 'value1', index: 7, position: { line: 1, column: 5 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 15, position: { line: 1, column: 13 }, isValid: true },

    { type: TokenType.Number, value: '123', index: 17, position: { line: 2, column: 0 }, isValid: false, message: ERROR_MESSAGES.UnenclosedKey },
    { type: TokenType.StructuralCharacter, value: ':', index: 20, position: { line: 2, column: 3 }, isValid: true },
    { type: TokenType.String, value: 'value2', index: 22, position: { line: 2, column: 5 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 30, position: { line: 2, column: 13 }, isValid: true },

    { type: TokenType.LiteralName, value: 'true', index: 32, position: { line: 3, column: 0}, isValid: false, message: ERROR_MESSAGES.UnenclosedKey },
    { type: TokenType.StructuralCharacter, value: ':', index: 36, position: { line: 3, column: 4 }, isValid: true },
    { type: TokenType.String, value: 'value3', index: 38, position: { line: 3, column: 6 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: '}', index: 47, position: { line: 4, column: 0 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize(jsonText)).toStrictEqual(ExpectedTokens);
})

test('Consecutive commas in an Object', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '{', index: 0, position: { line: 0, column: 0 }, isValid: true, depth: 1, closingLine: 0 },
    { type: TokenType.Key, value: 'key1', index: 2, position: { line: 0, column: 2 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 8, position: { line: 0, column: 8 }, isValid: true },
    { type: TokenType.String, value: 'value', index: 10, position: { line: 0, column: 10 }, isValid: true },

    { type: TokenType.StructuralCharacter, value: ',', index: 17, position: { line: 0, column: 17 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 18, position: { line: 0, column: 18 }, isValid: false, message: ERROR_MESSAGES.UnexpectedToken + "'KEY'" },

    { type: TokenType.Key, value: "key2", index: 20, position: { line: 0, column: 20 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 26, position: { line: 0, column: 26 }, isValid: true },
    { type: TokenType.Unexpected, value: 'Invalid', index: 28, position: { line: 0, column:  28}, isValid: false, message: ERROR_MESSAGES.UnexpectedLiteralName },
    { type: TokenType.StructuralCharacter, value: '}', index: 36, position: { line: 0, column: 36 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize('{ "key1": "value",, "key2": Invalid }')).toStrictEqual(ExpectedTokens);
})

test('Consecutive colons in an Object', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '{', index: 0, position: { line: 0, column: 0 }, isValid: true, depth: 1, closingLine: 0 },
    { type: TokenType.Key, value: 'key1', index: 2, position: { line: 0, column: 2 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 8, position: { line: 0, column: 8 }, isValid: true },
    { type: TokenType.String, value: 'value', index: 10, position: { line: 0, column: 10 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 17, position: { line: 0, column: 17 }, isValid: true },
    { type: TokenType.Key, value: "key2", index: 19, position: { line: 0, column: 19 }, isValid: true },

    { type: TokenType.StructuralCharacter, value: ':', index: 25, position: { line: 0, column: 25 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 26, position: { line: 0, column: 26 }, isValid: false, message: ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '['" },

    { type: TokenType.Unexpected, value: 'Invalid', index: 28, position: { line: 0, column:  28}, isValid: false, message: ERROR_MESSAGES.UnexpectedLiteralName },
    { type: TokenType.StructuralCharacter, value: '}', index: 36, position: { line: 0, column: 36 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize('{ "key1": "value", "key2":: Invalid }')).toStrictEqual(ExpectedTokens);
})

test('Trailing comma in an Array', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '[', index: 0, position: { line: 0, column: 0 }, isValid: true, depth: 1, closingLine: 0 },
    { type: TokenType.String, value: 'hello', index: 1, position: { line: 0, column: 1 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 8, position: { line: 0, column: 8 }, isValid: true },
    { type: TokenType.String, value: 'world', index: 10, position: { line: 0, column: 10 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 17, position: { line: 0, column: 17 }, isValid: true },
    { type: TokenType.Number, value: '10', index: 19, position: { line: 0, column: 19 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 21, position: { line: 0, column: 21 }, isValid: true },
    { type: TokenType.LiteralName, value: 'true', index: 23, position: { line: 0, column: 23 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 27, position: { line: 0, column: 27 }, isValid: false, message: ERROR_MESSAGES.TrailingComma }, 
    { type: TokenType.StructuralCharacter, value: ']', index: 28, position: { line: 0, column: 28 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize('["hello", "world", 10, true,]')).toStrictEqual(ExpectedTokens);
})

test('Trailing comma in an Object', () => {
  const ExpectedTokens: Token[] = [
    { type: TokenType.StructuralCharacter, value: '{', index: 0, position: { line: 0, column: 0 }, isValid: true, depth: 1, closingLine: 0 },
    { type: TokenType.Key, value: 'key1', index: 2, position: { line: 0, column: 2 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 8, position: { line: 0, column: 8 }, isValid: true },
    { type: TokenType.String, value: 'value', index: 10, position: { line: 0, column: 10 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 17, position: { line: 0, column: 17 }, isValid: true },
    { type: TokenType.Key, value: "key2", index: 19, position: { line: 0, column: 19 }, isValid: true },
    { type: TokenType.StructuralCharacter, value: ':', index: 25, position: { line: 0, column: 25 }, isValid: true  },
    { type: TokenType.String, value: 'value', index: 27, position: { line: 0, column:  27}, isValid: true },
    { type: TokenType.StructuralCharacter, value: ',', index: 34, position: { line: 0, column: 34 }, isValid: false, message:ERROR_MESSAGES.TrailingComma }, 
    { type: TokenType.StructuralCharacter, value: '}', index: 36, position: { line: 0, column: 36 }, isValid: true, depth: 1 }
  ];
  expect(_tokenize('{ "key1": "value", "key2": "value", }')).toStrictEqual(ExpectedTokens);
})

