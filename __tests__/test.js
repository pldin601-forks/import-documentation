// @flow

import assert from 'assert';
import { generate, write } from '../src/index';

test('test', () => {
  const files = [`${__dirname}/fixtures/example.js`];
  const docs = generate(files);
  write('/var/tmp', docs);
  console.log(docs);
});
