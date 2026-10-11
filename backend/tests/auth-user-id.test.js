import test from 'node:test';
import assert from 'node:assert/strict';

import { generateUniqueUserId } from '../src/services/auth.service.js';

test('generateUniqueUserId returns a unique 4-digit number', () => {
  const usedIds = new Set([1001, 1002, 1003]);
  const id = generateUniqueUserId(usedIds);

  assert.equal(typeof id, 'number');
  assert.equal(String(id).length, 4);
  assert.ok(!usedIds.has(id));
});
