#!/usr/bin/env node
'use strict';

const EpubConverter = require('../lib/convert.js');

const parseArgs = () =>
  process.argv.slice(2).reduce((args, arg) => {
    const [key, value] = arg.slice(2).split('=');
    if (value) {
      if (value === 'true') args[key] = true;
      else if (value === 'false') args[key] = false;
      else args[key] = value;
    }
    return args;
  }, {});

const { target, output } = parseArgs();

new EpubConverter({ target, output, cli: true }).convert();
