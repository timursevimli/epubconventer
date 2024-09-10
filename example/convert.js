'use strict';

const EpubConverter = require('epubconverter');

const convert = new EpubConverter('./documents', './documents/epubs');

convert.convert().finally(() => {
  console.log('All done!');
});
