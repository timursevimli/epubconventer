'use strict';

const fsp = require('node:fs/promises');

const isExist = async (fileName) => {
  const toBool = [() => true, () => false];
  const exist = await fsp.access(fileName).then(...toBool);
  return exist;
};

module.exports = {
  isExist,
};
