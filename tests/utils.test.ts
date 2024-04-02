import { expect, test } from 'vitest';
import { normalizeNewlines } from '../lib/utils';
// import { Token } from '../lib/types';

test('normalizeNewlines Function', () => {
  expect(normalizeNewlines('Hello,\nWorld!')).toStrictEqual('Hello,\nWorld!');
  expect(normalizeNewlines('Hello,\r\nWorld!')).toStrictEqual('Hello,\nWorld!');
  expect(normalizeNewlines('Hello,\rWorld!')).toStrictEqual('Hello,\nWorld!');
})
