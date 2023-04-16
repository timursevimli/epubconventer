'use strict';

const fs = require('node:fs');
const { extname } = require('node:path');
const { exec } = require('node:child_process');
const { promisify } = require('node:util');
const slugify = require('slugify');

const execPromise = promisify(exec);

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

class EpubConverter {
  #files = [];
  #targetPath;
  #outputPath;
  #onQueue;
  #converted = 0;

  constructor(targetPath = '.', outputPath = targetPath) {
    this.#targetPath = this.#ensureTrailingSlash(targetPath);
    this.#outputPath = this.#ensureTrailingSlash(outputPath);
    this.#getFiles();
    this.#checkOutputPath();
  }

  async convert() {
    const size = this.#files.length;
    if (size < 1) {
      throw new Error(
        'Target path is not include any file with \'.pdf\' extention'
      );
    }
    const doneFn = this.#allDone(size);
    for (const [i, fileName] of this.#files.entries()) {
      const sluggedName = this.#toSlugify(fileName);
      const execQuery = this.#createExecQuery(sluggedName);
      try {
        await this.#renameFile(fileName, sluggedName);
        await execPromise(execQuery);
        process.stdout.write(
          'filesOnQueue: ' + --this.#onQueue +
          ', convertedCount: ' + ++this.#converted +
          ', convertedFile: ' + fileName.slice(0, 17) + '...\r'
        );
        await this.#renameFile(sluggedName, fileName);
        await this.#renameFile(sluggedName, fileName, false);
      } catch (err) {
        console.error(`Failed to convert file '${fileName}': ${err}`);
      }
      doneFn(i);
    }
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
    this.#onQueue = this.#files.length;
  }

  #createExecQuery(fileName) {
    const epubFile = fileName.replace('.pdf', '.epub');
    const target = this.#targetPath + fileName;
    const output = this.#outputPath + epubFile;
    return `ebook-convert ${target} ${output}`;
  }

  #toSlugify(fileName) {
    return slugify(fileName, {
      remove: /[^a-zA-Z0-9_\-./]/g,
      replacement: '_',
      lower: true
    });
  }

  #renameFile(fileName, toFilename, isTarget = true) {
    const target = isTarget ?
      this.#targetPath + fileName :
      this.#outputPath + fileName.replace('.pdf', '.epub');
    const output = isTarget ?
      this.#targetPath + toFilename :
      this.#outputPath + toFilename.replace('.pdf', '.epub');
    return new Promise((resolve, reject) => {
      fs.rename(target, output, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  #allDone(count) {
    return (i) => {
      if (i === count - 1) {
        console.log('\x1b[2JAll done!');
        process.exit(1);
      }
    };
  }
}

module.exports = EpubConverter;
