// @flow

import assert from 'assert';
import importerSync from '../src/index';

test('test', () => {
  const files = [`${__dirname}/fixtures/example.js`];
  const docs = importerSync(files);
  // { package: documentation-md, ... }
});
