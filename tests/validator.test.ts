import { expect, test } from 'vitest';
import { Token, TokenType } from '../lib/types';
import { ERROR_MESSAGES } from '../lib/utils'
import { 
  isStructuralCharacter, 
  // isBeginArrayOrObjectType, 
  // isPrimitiveType, 
  // isUnescaped, 
  isValidString,
  isValidNumberString, 
  // isInteroperableNumberString,
  isValidLiteralName,
  isKey,
  isKeyUnique,
  updateKeyStack,
  isExpectingToken
} from '../lib/validator';

test('isStructuralCharacter Function', () => {
  // is Structural Character 
  expect(isStructuralCharacter('[')).toBe(true);
  expect(isStructuralCharacter(']')).toBe(true);
  expect(isStructuralCharacter('{')).toBe(true);
  expect(isStructuralCharacter('}')).toBe(true);
  expect(isStructuralCharacter(',')).toBe(true);
  expect(isStructuralCharacter(':')).toBe(true);
  // not i sStructura lCharacter
  expect(isStructuralCharacter('"')).toBe(false);
  expect(isStructuralCharacter('char')).toBe(false);
})

// test('isBeginArrayOrObjectType Function', () => {
//   expect(isBeginArrayOrObje  ctType(TokenType.StructuralCharacter, '[')).toBe(true)
//   expect(isBeginArrayOrObjectType(TokenType.StructuralCharacter, '{')).toBe(true)
//   expect(isBeginArrayOrObjectType(TokenType.StructuralCharacter, ']')).toBe(false)
//   expect(isBeginArrayOrObjectType(TokenType.StructuralCharacter, '12')).toBe(false)
// })

// test('isPrimitiveType Function', () => {
//   expect(isPrimitiveType(TokenType.String)).toBe(true)
//   expect(isPrimitiveType(TokenType.Number)).toBe(true)
//   expect(isPrimitiveType(TokenType.LiteralName)).toBe(true)
//   expect(isPrimitiveType(TokenType.StructuralCharacter)).toBe(false)
//   expect(isPrimitiveType(TokenType.Key)).toBe(false)
//   expect(isPrimitiveType(TokenType.Unexpected)).toBe(false)
// })

// test('isUnescaped Function', () => {
//   // unescaped = %x20-21 / %x23-5B / %x5D-10FFFF
//   expect(isUnescaped('/')).toBe(true)
//   expect(isUnescaped('a')).toBe(true)
//   expect(isUnescaped('\u0020')).toBe(true)
//   expect(isUnescaped('\u0021')).toBe(true)
//   expect(isUnescaped('!')).toBe(true) // 0x21
//   expect(isUnescaped('#')).toBe(true) // 0x23
//   expect(isUnescaped('[')).toBe(true) // 0x5B
//   expect(isUnescaped(']')).toBe(true) // 0x5D

//   expect(isUnescaped('\u0000')).toBe(false)
//   expect(isUnescaped('\u0019')).toBe(false)
//   expect(isUnescaped('"')).toBe(false) // 0x22
//   expect(isUnescaped('\\')).toBe(false) // 0x5C
//   expect(isUnescaped('hello')).toBe(false)
// })

test('isValidString Function', () => {
  const ValidResult = {isValid: true, message: ""}
  expect(isValidString('\\"')).toStrictEqual(ValidResult);
  expect(isValidString('\\\\')).toStrictEqual(ValidResult);
  expect(isValidString('\\/')).toStrictEqual(ValidResult);
  expect(isValidString('\\b')).toStrictEqual(ValidResult);
  expect(isValidString('\\f')).toStrictEqual(ValidResult);
  expect(isValidString('\\n')).toStrictEqual(ValidResult);
  expect(isValidString('\\r')).toStrictEqual(ValidResult);
  expect(isValidString('\\t')).toStrictEqual(ValidResult);
  expect(isValidString('\\u0000')).toStrictEqual(ValidResult);
  expect(isValidString('\\uAbCd')).toStrictEqual(ValidResult);

  expect(isValidString('\\u')).toStrictEqual({isValid: false, message: ERROR_MESSAGES.BadUnicodeEscape});
  expect(isValidString('\\uGGGG')).toStrictEqual({isValid: false, message: ERROR_MESSAGES.BadUnicodeEscape});
  expect(isValidString('\\')).toStrictEqual({isValid: false, message: ERROR_MESSAGES.BadUnicodeEscape});
  
  expect(isValidString('"')).toStrictEqual({isValid: false, message: ERROR_MESSAGES.BadControlCharacter});
  expect(isValidString('\u0000')).toStrictEqual({isValid: false, message: ERROR_MESSAGES.BadControlCharacter});

  // expect(isValidString('\\')).toBe(true);
})

test('isValidNumberString Function', () => {
  // integer 
  expect(isValidNumberString('0')).toBe(true);
  expect(isValidNumberString('-0')).toBe(true);
  expect(isValidNumberString('123')).toBe(true);
  expect(isValidNumberString('-456')).toBe(true);
  // fraction
  expect(isValidNumberString('12.34')).toBe(true);
  expect(isValidNumberString('-0.56')).toBe(true);
  expect(isValidNumberString('0.0')).toBe(true);
  // exponent
  expect(isValidNumberString('1e3')).toBe(true);
  expect(isValidNumberString('-2.5e-4')).toBe(true);
  expect(isValidNumberString('6E10')).toBe(true);
  // invalid format
  expect(isValidNumberString('')).toBe(false);
  expect(isValidNumberString('.')).toBe(false);
  expect(isValidNumberString('.75')).toBe(false);
  expect(isValidNumberString('abc')).toBe(false);
  expect(isValidNumberString('1e')).toBe(false);
})

// test('isInteroperableNumberString Function', () => {
//   // integer 
//   expect(isInteroperableNumberString('0')).toBe(true);
//   expect(isInteroperableNumberString('-0')).toBe(true); // 
//   expect(isInteroperableNumberString('123')).toBe(true);
//   expect(isInteroperableNumberString('-456')).toBe(true);
//   // fraction
//   expect(isInteroperableNumberString('12.34')).toBe(true);
//   expect(isInteroperableNumberString('-0.56')).toBe(true);
//   expect(isInteroperableNumberString('0.0')).toBe(true); // 
//   // exponent
//   expect(isInteroperableNumberString('1e3')).toBe(true); // 
//   expect(isInteroperableNumberString('-2.5e-4')).toBe(true); // 
//   expect(isInteroperableNumberString('6E10')).toBe(true); // 
//   // invalid format
//   // expect(isInteroperableNumberString('3.141592653589793238462643383279')).toBe(false);
//   expect(isInteroperableNumberString('1E400')).toBe(false);

//   // expect(isInteroperableNumberString('')).toBe(true);
//   expect(isInteroperableNumberString('.')).toBe(false);
//   expect(isInteroperableNumberString('.')).toBe(false);
//   expect(isInteroperableNumberString('abc')).toBe(false);
//   expect(isInteroperableNumberString('1e')).toBe(false);
// })

test('isValidLiteralName Function', () => {
  expect(isValidLiteralName('true')).toBe(true);
  expect(isValidLiteralName('false')).toBe(true);
  expect(isValidLiteralName('null')).toBe(true);
  
  expect(isValidLiteralName('hello')).toBe(false);
})

test('isKey Function', () => {
  const token1 = {
    type: TokenType.StructuralCharacter,
    value: '{',
    index: 0,
    position: {line: 0, column: 0},
    isValid: true
  }

  const token2 = {
    type: TokenType.StructuralCharacter,
    value: ',',
    index: 1,
    position: {line: 0, column: 1},
    isValid: true
  }

  const token3 = {
    type: TokenType.String,
    value: 'a',
    index: 1,
    position: {line: 0, column: 1},
    isValid: true
  }

  const leftBracketStack = [token1]

  expect(isKey(token1, leftBracketStack)).toBe(true)

  expect(isKey(token2, leftBracketStack)).toBe(true)

  expect(isKey(undefined, leftBracketStack)).toBe(false)

  expect(isKey(token3, leftBracketStack)).toBe(false)

  expect(isKey(token1, [])).toBe(false)
})

test('isKeyUnique Function', () => {
  expect(isKeyUnique("key1", [["key2", "key3"]])).toBe(true)
  expect(isKeyUnique("key1", [["key1"], ["key2", "key3"]])).toBe(true)

  expect(isKeyUnique("key1", [["key1", "key2"]])).toBe(false)
  expect(isKeyUnique("key1", [["key1", "key2"], ["key1", "key2"]])).toBe(false)
})

test('updateKeyStack Function', () => {
  let keyStack = [];
  // Create a new scope when { comes in
  updateKeyStack('{', keyStack);
  expect(keyStack.length).toBe(1);
  // removes the current scope when } comes in
  updateKeyStack('}', keyStack);
  expect(keyStack.length).toBe(0);
})


// isExpectingToken

function createToken(type: TokenType, value: string, isValid: boolean = true, message: string = ''): Token {
  // The values of index and position are not used in the isExpectingToken function, 
  // so they are set to 0 for simplicity.
  return {
    type,
    value,
    index: 0,
    position: { line: 0, column: 0 },
    isValid,
    message
  };
}

// prevToken===undefined
test('isExpectingToken Function with no previous token and empty left bracket stack', () => {
  // if (!prevToken)
  const leftBracketStack: Token[] = [];
  const prevToken: Token | undefined = undefined;

  const result1 = isExpectingToken(createToken(TokenType.String, 'test'), prevToken, leftBracketStack);
  const result2 = isExpectingToken(createToken(TokenType.Number, '1'), prevToken, leftBracketStack);
  const result3 = isExpectingToken(createToken(TokenType.LiteralName, 'true'), prevToken, leftBracketStack);
  const result4 = isExpectingToken(createToken(TokenType.LiteralName, 'false'), prevToken, leftBracketStack);
  const result5 = isExpectingToken(createToken(TokenType.LiteralName, 'null'), prevToken, leftBracketStack);
  const result6 = isExpectingToken(createToken(TokenType.StructuralCharacter, '['), prevToken, leftBracketStack);
  const result7 = isExpectingToken(createToken(TokenType.StructuralCharacter, '{'), prevToken, leftBracketStack);

  expect(result1.isValid).toBe(true);
  expect(result1.message).toBe("");
  expect(result2.isValid).toBe(true);
  expect(result2.message).toBe("");
  expect(result3.isValid).toBe(true);
  expect(result3.message).toBe("");
  expect(result4.isValid).toBe(true);
  expect(result4.message).toBe("");
  expect(result5.isValid).toBe(true);
  expect(result5.message).toBe("");
  expect(result6.isValid).toBe(true);
  expect(result6.message).toBe("");
  expect(result7.isValid).toBe(true);
  expect(result7.message).toBe("");

  const result8 = isExpectingToken(createToken(TokenType.Unexpected, 'hello'), prevToken, leftBracketStack);
  const result9 = isExpectingToken(createToken(TokenType.StructuralCharacter, ':'), prevToken, leftBracketStack);
  const result10 = isExpectingToken(createToken(TokenType.StructuralCharacter, ','), prevToken, leftBracketStack);
  const result11 = isExpectingToken(createToken(TokenType.StructuralCharacter, ']'), prevToken, leftBracketStack);
  const result12 = isExpectingToken(createToken(TokenType.StructuralCharacter, '}'), prevToken, leftBracketStack);

  let expectedMessage = ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '['";
  expect(result8.isValid).toBe(false);
  expect(result8.message).toBe(expectedMessage);
  expect(result9.isValid).toBe(false);
  expect(result9.message).toBe(expectedMessage);
  expect(result10.isValid).toBe(false);
  expect(result10.message).toBe(expectedMessage);
  expect(result11.isValid).toBe(false);
  expect(result11.message).toBe(expectedMessage);
  expect(result12.isValid).toBe(false);
  expect(result12.message).toBe(expectedMessage);
});
// prevToken!==undefined && leftBracketStack.length===0
test('isExpectingToken Function with no left bracket stack', () => {
  // else if (leftBracketStack.length===0) 
  const leftBracketStack: Token[] = [];
  const prevToken: Token | undefined = createToken(TokenType.String, 'test');
  const result1 = isExpectingToken(createToken(TokenType.String, 'test'), prevToken, leftBracketStack);
  expect(result1.isValid).toBe(false);
  expect(result1.message).toBe(ERROR_MESSAGES.NotEOF);

  const result2 = isExpectingToken(createToken(TokenType.Number, '100'), prevToken, leftBracketStack);
  expect(result2.isValid).toBe(false);
  expect(result2.message).toBe(ERROR_MESSAGES.NotEOF);
})
// prevToken!==undefined && leftBracketStack.length>0
test('isExpectingToken Function with prevToken.type === TokenType.StructuralCharacter and prevToken.value === END_ARRAY', () => {
  let prevToken: Token = createToken(TokenType.StructuralCharacter, ']');

  // [[]
  let leftBracketStack: Token[] = [createToken(TokenType.StructuralCharacter, '[')];
  // currentToken
  const result1 = isExpectingToken(createToken(TokenType.StructuralCharacter, ','), prevToken, leftBracketStack);
  const result2 = isExpectingToken(createToken(TokenType.StructuralCharacter, ']'), prevToken, leftBracketStack);
  const result3 = isExpectingToken(createToken(TokenType.StructuralCharacter, '}'), prevToken, leftBracketStack);
  const result4 = isExpectingToken(createToken(TokenType.String, 'hello'), prevToken, leftBracketStack);
  const result5 = isExpectingToken(createToken(TokenType.Number, '100'), prevToken, leftBracketStack);
  const result6 = isExpectingToken(createToken(TokenType.LiteralName, 'true'), prevToken, leftBracketStack);
  const result7 = isExpectingToken(createToken(TokenType.Unexpected, 'unexpected'), prevToken, leftBracketStack);

  expect(result1.isValid).toBe(true);
  expect(result1.message).toBe("");
  expect(result2.isValid).toBe(true);
  expect(result2.message).toBe("");
  expect(result3.isValid).toBe(false);
  expect(result3.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', ']'");
  expect(result4.isValid).toBe(false);
  expect(result4.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', ']'");
  expect(result5.isValid).toBe(false);
  expect(result5.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', ']'");
  expect(result6.isValid).toBe(false);
  expect(result6.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', ']'");
  expect(result7.isValid).toBe(false);
  expect(result7.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', ']'");

  // { []
  leftBracketStack= [createToken(TokenType.StructuralCharacter, '{')];
  // currentToken
  const result8 = isExpectingToken(createToken(TokenType.StructuralCharacter, ','), prevToken, leftBracketStack);
  const result9 = isExpectingToken(createToken(TokenType.StructuralCharacter, '}'), prevToken, leftBracketStack);
  const result10 = isExpectingToken(createToken(TokenType.StructuralCharacter, ']'), prevToken, leftBracketStack);
  const result11 = isExpectingToken(createToken(TokenType.String, 'hello'), prevToken, leftBracketStack);
  const result12 = isExpectingToken(createToken(TokenType.Number, '100'), prevToken, leftBracketStack);
  const result13 = isExpectingToken(createToken(TokenType.LiteralName, 'true'), prevToken, leftBracketStack);
  const result14 = isExpectingToken(createToken(TokenType.Unexpected, 'unexpected'), prevToken, leftBracketStack);

  expect(result8.isValid).toBe(true);
  expect(result8.message).toBe("");
  expect(result9.isValid).toBe(true);
  expect(result9.message).toBe("");
  expect(result10.isValid).toBe(false);
  expect(result10.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', '}'");
  expect(result11.isValid).toBe(false);
  expect(result11.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', '}'");
  expect(result12.isValid).toBe(false);
  expect(result12.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', '}'");
  expect(result13.isValid).toBe(false);
  expect(result13.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', '}'");
  expect(result14.isValid).toBe(false);
  expect(result14.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', '}'");
});
test('isExpectingToken Function with prevToken.type === TokenType.StructuralCharacter and prevToken.value === END_OBJECT', () => {
  let prevToken: Token = createToken(TokenType.StructuralCharacter, '}');

  // [{}
  let leftBracketStack: Token[] = [createToken(TokenType.StructuralCharacter, '[')];
  // currentToken
  const result1 = isExpectingToken(createToken(TokenType.StructuralCharacter, ','), prevToken, leftBracketStack);
  const result2 = isExpectingToken(createToken(TokenType.StructuralCharacter, ']'), prevToken, leftBracketStack);
  const result3 = isExpectingToken(createToken(TokenType.StructuralCharacter, '}'), prevToken, leftBracketStack);
  const result4 = isExpectingToken(createToken(TokenType.String, 'hello'), prevToken, leftBracketStack);
  const result5 = isExpectingToken(createToken(TokenType.Number, '100'), prevToken, leftBracketStack);
  const result6 = isExpectingToken(createToken(TokenType.LiteralName, 'true'), prevToken, leftBracketStack);
  const result7 = isExpectingToken(createToken(TokenType.Unexpected, 'unexpected'), prevToken, leftBracketStack);

  expect(result1.isValid).toBe(true);
  expect(result1.message).toBe("");
  expect(result2.isValid).toBe(true);
  expect(result2.message).toBe("");
  expect(result3.isValid).toBe(false);
  expect(result3.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', ']'");
  expect(result4.isValid).toBe(false);
  expect(result4.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', ']'");
  expect(result5.isValid).toBe(false);
  expect(result5.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', ']'");
  expect(result6.isValid).toBe(false);
  expect(result6.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', ']'");
  expect(result7.isValid).toBe(false);
  expect(result7.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', ']'");

  // { {}
  leftBracketStack= [createToken(TokenType.StructuralCharacter, '{')];
  // currentToken
  const result8 = isExpectingToken(createToken(TokenType.StructuralCharacter, ','), prevToken, leftBracketStack);
  const result9 = isExpectingToken(createToken(TokenType.StructuralCharacter, '}'), prevToken, leftBracketStack);
  const result10 = isExpectingToken(createToken(TokenType.StructuralCharacter, ']'), prevToken, leftBracketStack);
  const result11 = isExpectingToken(createToken(TokenType.String, 'hello'), prevToken, leftBracketStack);
  const result12 = isExpectingToken(createToken(TokenType.Number, '100'), prevToken, leftBracketStack);
  const result13 = isExpectingToken(createToken(TokenType.LiteralName, 'true'), prevToken, leftBracketStack);
  const result14 = isExpectingToken(createToken(TokenType.Unexpected, 'unexpected'), prevToken, leftBracketStack);

  expect(result8.isValid).toBe(true);
  expect(result8.message).toBe("");
  expect(result9.isValid).toBe(true);
  expect(result9.message).toBe("");
  expect(result10.isValid).toBe(false);
  expect(result10.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', '}'");
  expect(result11.isValid).toBe(false);
  expect(result11.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', '}'");
  expect(result12.isValid).toBe(false);
  expect(result12.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', '}'");
  expect(result13.isValid).toBe(false);
  expect(result13.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', '}'");
  expect(result14.isValid).toBe(false);
  expect(result14.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', '}'");
});
test('isExpectingToken Function with prevToken.type === TokenType.StructuralCharacter and prevToken.value === BEGIN_ARRAY', () => {
  let prevToken: Token = createToken(TokenType.StructuralCharacter, '[');

  // [, [[, {[, ...
  let leftBracketStack: Token[] = [
    // createToken(TokenType.StructuralCharacter, '{'),
    prevToken
  ];
  // currentToken
  const result1 = isExpectingToken(createToken(TokenType.StructuralCharacter, '['), prevToken, leftBracketStack);
  const result2 = isExpectingToken(createToken(TokenType.StructuralCharacter, '{'), prevToken, leftBracketStack);
  const result3 = isExpectingToken(createToken(TokenType.StructuralCharacter, ']'), prevToken, leftBracketStack);
  const result4 = isExpectingToken(createToken(TokenType.String, 'hello'), prevToken, leftBracketStack);
  const result5 = isExpectingToken(createToken(TokenType.Number, '100'), prevToken, leftBracketStack);
  const result6 = isExpectingToken(createToken(TokenType.LiteralName, 'true'), prevToken, leftBracketStack);
  expect(result1.isValid).toBe(true);
  expect(result1.message).toBe("");
  expect(result2.isValid).toBe(true);
  expect(result2.message).toBe("");
  expect(result3.isValid).toBe(true);
  expect(result3.message).toBe("");
  expect(result4.isValid).toBe(true);
  expect(result4.message).toBe("");
  expect(result5.isValid).toBe(true);
  expect(result5.message).toBe("");
  expect(result6.isValid).toBe(true);
  expect(result6.message).toBe("");

  const result7 = isExpectingToken(createToken(TokenType.Unexpected, 'unexpected'), prevToken, leftBracketStack);
  const result8 = isExpectingToken(createToken(TokenType.StructuralCharacter, '}'), prevToken, leftBracketStack);
  const result9 = isExpectingToken(createToken(TokenType.StructuralCharacter, ':'), prevToken, leftBracketStack);
  const result10 = isExpectingToken(createToken(TokenType.StructuralCharacter, ','), prevToken, leftBracketStack);
  expect(result7.isValid).toBe(false);
  expect(result7.message).toBe(ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '[', ']''");
  expect(result8.isValid).toBe(false);
  expect(result8.message).toBe(ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '[', ']''");
  expect(result9.isValid).toBe(false);
  expect(result9.message).toBe(ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '[', ']''");
  expect(result10.isValid).toBe(false);
  expect(result10.message).toBe(ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '[', ']''");
});

test('isExpectingToken function with prevToken.type === TokenType.StructuralCharacter and prevToken.value === BEGIN_OBJECT', () => {
  let prevToken: Token = createToken(TokenType.StructuralCharacter, '{');

  // {, [{, {{, ...
  let leftBracketStack: Token[] = [
    // createToken(TokenType.StructuralCharacter, '{'),
    prevToken
  ];
  // currentToken
  const result1 = isExpectingToken(createToken(TokenType.Key, 'key'), prevToken, leftBracketStack);
  const result2 = isExpectingToken(createToken(TokenType.StructuralCharacter, '}'), prevToken, leftBracketStack);
  const result3 = isExpectingToken(createToken(TokenType.Number, '100'), prevToken, leftBracketStack);
  const result4 = isExpectingToken(createToken(TokenType.LiteralName, 'true'), prevToken, leftBracketStack);
  const result5 = isExpectingToken(createToken(TokenType.Unexpected, 'unexpected'), prevToken, leftBracketStack);

  expect(result1.isValid).toBe(true);
  expect(result1.message).toBe("");
  expect(result2.isValid).toBe(true);
  expect(result2.message).toBe("");
  expect(result3.isValid).toBe(false);
  expect(result3.message).toBe(ERROR_MESSAGES.UnenclosedKey);
  expect(result4.isValid).toBe(false);
  expect(result4.message).toBe(ERROR_MESSAGES.UnenclosedKey);
  expect(result5.isValid).toBe(false);
  expect(result5.message).toBe(ERROR_MESSAGES.UnenclosedKey);
});

test('isExpectingToken function with prevToken.type === TokenType.StructuralCharacter and prevToken.value === VALUE_SEPARATOR', () => {
  let prevToken: Token = createToken(TokenType.StructuralCharacter, ',');

  // [  
  let leftBracketStack: Token[] = [createToken(TokenType.StructuralCharacter, '[')];

  const result1 = isExpectingToken(createToken(TokenType.StructuralCharacter, '['), prevToken, leftBracketStack);
  expect(result1.isValid).toBe(true);
  expect(result1.message).toBe("");

  const result2 = isExpectingToken(createToken(TokenType.StructuralCharacter, '}'), prevToken, leftBracketStack);
  const result3 = isExpectingToken(createToken(TokenType.StructuralCharacter, ','), prevToken, leftBracketStack);
  const result4 = isExpectingToken(createToken(TokenType.StructuralCharacter, ':'), prevToken, leftBracketStack);
  expect(result2.isValid).toBe(false);
  expect(result2.message).toBe(ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '['");
  expect(result3.isValid).toBe(false);
  expect(result3.message).toBe(ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '['");
  expect(result4.isValid).toBe(false);
  expect(result4.message).toBe(ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '['");
  
  // {
  leftBracketStack= [createToken(TokenType.StructuralCharacter, '{')];

  const result5 = isExpectingToken(createToken(TokenType.Key, 'key'), prevToken, leftBracketStack);
  expect(result5.isValid).toBe(true);
  expect(result5.message).toBe("");

  const result6 = isExpectingToken(createToken(TokenType.StructuralCharacter, '}'), prevToken, leftBracketStack);
  // expect(result6.isValid).toBe(false);
  expect(result6.isValid).toBe(true);
  // expect(result6.message).toBe("Expecting 'KEY'");

});

test('isExpectingToken function with prevToken.type === TokenType.StructuralCharacter and prevToken.value === NAME_SEPARATOR', () => {
  let prevToken: Token = createToken(TokenType.StructuralCharacter, ':');

  let leftBracketStack: Token[] = [
    createToken(TokenType.StructuralCharacter, '['),
    createToken(TokenType.StructuralCharacter, '{')
  ];

  const result1 = isExpectingToken(createToken(TokenType.StructuralCharacter, '['), prevToken, leftBracketStack);
  const result2 = isExpectingToken(createToken(TokenType.String, 'hello'), prevToken, leftBracketStack);

  expect(result1.isValid).toBe(true);
  expect(result1.message).toBe("");

  expect(result2.isValid).toBe(true);
  expect(result2.message).toBe("");

  const result3 = isExpectingToken(createToken(TokenType.StructuralCharacter, ']'), prevToken, leftBracketStack);
  const result4 = isExpectingToken(createToken(TokenType.StructuralCharacter, '}'), prevToken, leftBracketStack);
  const result5= isExpectingToken(createToken(TokenType.StructuralCharacter, ','), prevToken, leftBracketStack);
  const result6 = isExpectingToken(createToken(TokenType.StructuralCharacter, ':'), prevToken, leftBracketStack);

  expect(result3.isValid).toBe(false);
  expect(result3.message).toBe(ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '['");
  expect(result4.isValid).toBe(false);
  expect(result4.message).toBe(ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '['");
  expect(result5.isValid).toBe(false);
  expect(result5.message).toBe(ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '['");
  expect(result6.isValid).toBe(false);
  expect(result6.message).toBe(ERROR_MESSAGES.UnexpectedToken + "'STRING', 'NUMBER', 'null', 'true', 'false', '{', '['");
});

test('isExpectingToken function with prevToken.type === TokenType.Key', () => {
  let prevToken: Token = createToken(TokenType.Key, 'key');

  let leftBracketStack: Token[] = [
    createToken(TokenType.StructuralCharacter, '['),
    // createToken(TokenType.StructuralCharacter, '{')
  ];
  const result1 = isExpectingToken(createToken(TokenType.StructuralCharacter, ':'), prevToken, leftBracketStack);
  expect(result1.isValid).toBe(true);
  expect(result1.message).toBe("");

  const result2 = isExpectingToken(createToken(TokenType.String, 'hello'), prevToken, leftBracketStack);
  const result3 = isExpectingToken(createToken(TokenType.Number, '10'), prevToken, leftBracketStack);
  const result4 = isExpectingToken(createToken(TokenType.LiteralName, 'true'), prevToken, leftBracketStack);
  const result5 = isExpectingToken(createToken(TokenType.StructuralCharacter, ','), prevToken, leftBracketStack);

  expect(result2.isValid).toBe(false);
  expect(result2.message).toBe(ERROR_MESSAGES.UnexpectedToken + "':'");
  expect(result3.isValid).toBe(false);
  expect(result3.message).toBe(ERROR_MESSAGES.UnexpectedToken + "':'");
  expect(result4.isValid).toBe(false);
  expect(result4.message).toBe(ERROR_MESSAGES.UnexpectedToken + "':'");
  expect(result5.isValid).toBe(false);
  expect(result5.message).toBe(ERROR_MESSAGES.UnexpectedToken + "':'");
});

test('isExpectingToken function with prevToken.type is PrimitiveType', () => {
  // let prevToken: Token = createToken(TokenType.String, 'hello');
  // let prevToken: Token = createToken(TokenType.Number, '10');
  let prevToken: Token = createToken(TokenType.LiteralName, 'true');

  // [
  let leftBracketStack: Token[] = [createToken(TokenType.StructuralCharacter, '[')];

  const result1 = isExpectingToken(createToken(TokenType.StructuralCharacter, ','), prevToken, leftBracketStack);
  const result2 = isExpectingToken(createToken(TokenType.StructuralCharacter, ']'), prevToken, leftBracketStack);
  expect(result1.isValid).toBe(true);
  expect(result1.message).toBe("");
  expect(result2.isValid).toBe(true);
  expect(result2.message).toBe("");

  const result3 = isExpectingToken(createToken(TokenType.StructuralCharacter, '}'), prevToken, leftBracketStack);
  expect(result3.isValid).toBe(false);
  expect(result3.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', ']'");

  // {
  leftBracketStack= [createToken(TokenType.StructuralCharacter, '{')];

  const result4 = isExpectingToken(createToken(TokenType.StructuralCharacter, ','), prevToken, leftBracketStack);
  const result5 = isExpectingToken(createToken(TokenType.StructuralCharacter, '}'), prevToken, leftBracketStack);
  expect(result4.isValid).toBe(true);
  expect(result4.message).toBe("");
  expect(result5.isValid).toBe(true);
  expect(result5.message).toBe("");

  
  const result6= isExpectingToken(createToken(TokenType.StructuralCharacter, ']'), prevToken, leftBracketStack);
  expect(result6.isValid).toBe(false);
  expect(result6.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', '}'");
});

test('isExpectingToken function with prevToken.type === TokenType.Unexpected', () => {
  let prevToken: Token = createToken(TokenType.Unexpected, 'unexpected');

  // [
  let leftBracketStack: Token[] = [createToken(TokenType.StructuralCharacter, '[')];

  const result1 = isExpectingToken(createToken(TokenType.StructuralCharacter, ','), prevToken, leftBracketStack);
  const result2 = isExpectingToken(createToken(TokenType.StructuralCharacter, ']'), prevToken, leftBracketStack);  
  expect(result1.isValid).toBe(true);
  expect(result1.message).toBe("");
  expect(result2.isValid).toBe(true);
  expect(result2.message).toBe("");

  const result3 = isExpectingToken(createToken(TokenType.StructuralCharacter, ':'), prevToken, leftBracketStack);
  expect(result3.isValid).toBe(false);
  expect(result3.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', ']'");

  // {
    leftBracketStack= [createToken(TokenType.StructuralCharacter, '{')];

    const result4 = isExpectingToken(createToken(TokenType.StructuralCharacter, ','), prevToken, leftBracketStack);
    const result5 = isExpectingToken(createToken(TokenType.StructuralCharacter, '}'), prevToken, leftBracketStack);
    expect(result4.isValid).toBe(true);
    expect(result4.message).toBe("");
    expect(result5.isValid).toBe(true);
    expect(result5.message).toBe("");
  
    const result6= isExpectingToken(createToken(TokenType.StructuralCharacter, ']'), prevToken, leftBracketStack);
    expect(result6.isValid).toBe(false);
    expect(result6.message).toBe(ERROR_MESSAGES.UnexpectedToken + "',', '}'");
});
