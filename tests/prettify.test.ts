import { expect, test } from 'vitest';
import { _prettify } from '../lib/prettify';
import { ERROR_MESSAGES } from '../lib/utils';

const testCases: { input: string, expected: string }[] = [
  {
    input: '     "hello"    ',
    expected: `"hello"`
  },
  {
    input: '\n25',
    expected: `25`
  },
  {
    input: '{"name":"John","age":30,"city":"New York"}',
    expected: `{\n\t"name": "John",\n\t"age": 30,\n\t"city": "New York"\n}`
  },
  {
    input: '[{"name":"John","age":30},{"name":"Jane","age":25}]',
    expected: `[\n\t{\n\t\t"name": "John",\n\t\t"age": 30\n\t},\n\t{\n\t\t"name": "Jane",\n\t\t"age": 25\n\t}\n]`
  },

  // output = `Parse error on line ${position.line+1}, column ${position.column+1}: \n${value}\n^\n${message}`;
  {
    input: '{"na\nme":"John","age":30,"city":"New York"}',
    expected: `Parse error on line 1, column 2: \n"na\nme\n^\n${ERROR_MESSAGES.BadControlCharacter}`
  },
];
  
test('isStructuralCharacter Function', () => {
  expect(_prettify(testCases[0].input)).toStrictEqual(testCases[0].expected);
  expect(_prettify(testCases[1].input)).toStrictEqual(testCases[1].expected);
  expect(_prettify(testCases[2].input)).toStrictEqual(testCases[2].expected);
  expect(_prettify(testCases[3].input)).toStrictEqual(testCases[3].expected);
  expect(_prettify(testCases[4].input)).toStrictEqual(testCases[4].expected);
})