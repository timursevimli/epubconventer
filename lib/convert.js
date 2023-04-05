'use strict';

const fs = require('node:fs');
const { extname } = require('node:path');
const { exec } = require('node:child_process');
const { promisify } = require('node:util');

exec('ebook-convert --version', (err, stdout) => {
  if (err) {
    console.error(err);
    process.exit(0);
  }
  const toolInclude = stdout.includes('ebook-convert');
  if (!toolInclude) {
    console.log('Please install ebook-convert tool on your machine: https://calibre-ebook.com/download');
    process.exit(0);
  }
});

const execAsync = promisify(exec);

class EpubConverter {
  #files = [];
  #targetPath;
  #outputPath;

  constructor(targetPath = '.', outputPath = targetPath) {
    this.#targetPath = this.#ensureTrailingSlash(targetPath);
    this.#outputPath = this.#ensureTrailingSlash(outputPath);
    this.#getFiles();
    this.#checkOutputPath();
  }

  #checkOutputPath() {
    if (this.#targetPath === this.#outputPath) return;
    try {
      fs.accessSync(this.#outputPath);
    } catch (err) {
      fs.mkdirSync(this.#outputPath);
    }
  }

  #ensureTrailingSlash(path) {
    return path.endsWith('/') ? path : path + '/';
  }

  #isFile(filePath) {
    return fs.statSync(filePath).isFile();
  }

  #extentionIsPdf(fileName) {
    return extname(fileName) === '.pdf';
  }

  #getFiles() {
    const files = fs.readdirSync(this.#targetPath);
    for (const fileName of files) {
      if (!this.#extentionIsPdf(fileName)) continue;
      if (!this.#isFile(this.#targetPath + fileName)) continue;
      this.#files.push(fileName);
    }
  }

  #createExecQuery(fileName) {
    const epubFile = fileName.replace('.pdf', '.epub');
    const target = this.#targetPath + fileName;
    const output = this.#outputPath + epubFile;
    return `ebook-convert ${target} ${output}`;
  }

  convert() {
    if (this.#files.length < 1) {
      throw new Error(
        'Target path is not include any file with \'.pdf\' extention'
      );
    }
    const promises = this.#files.map((fileName) => {
      const execQuery = this.#createExecQuery.call(this, fileName);
      return execAsync(execQuery);
    });
    Promise.all(promises)
      .catch((err) => console.error(err.message));
  }
}

module.exports = EpubConverter;
