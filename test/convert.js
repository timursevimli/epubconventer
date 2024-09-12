'use strict';

const assert = require('node:assert');
const test = require('node:test');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { promisify } = require('node:util');
const { exec } = require('node:child_process');
const { isExist } = require('./helper.js');
const EpubConverter = require('../lib/convert.js');

const FILE_PATH = path.join(__dirname, 'file');
const target = FILE_PATH;
const output = path.join(FILE_PATH, 'epubs');

test.afterEach(async () => {
  await fsp.rm(output, { recursive: true });
});

test('convert (module)', async () => {
  const convert = new EpubConverter({ target, output });
  await convert.convert();

  assert.ok(await isExist(output));
  assert.ok(await isExist(path.join(output, 'sample.epub')));
});

test('convert (cli)', async () => {
  const cmd = `node ./bin/convert.js --target=${target} --output=${output}`;
  await promisify(exec)(cmd);
  assert.ok(await isExist(output));
  assert.ok(await isExist(path.join(output, 'sample.epub')));
});
