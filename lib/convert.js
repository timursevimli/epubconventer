'use strict';

const fs = require('node:fs');
const fsp = fs.promises;
const path = require('node:path');
const os = require('node:os');
const { exec, execSync } = require('node:child_process');
const { promisify } = require('node:util');
const slugify = require('slugify');
const Kuyruk = require('kuyruk');

const calibreExist = execSync('ebook-convert --version')
  .toString()
  .includes('ebook-convert');

if (!calibreExist) {
  console.log(
    'Please install ebook-convert tool on your machine: https://calibre-ebook.com/download',
  );
  process.exit(1);
}

const queue = new Kuyruk({ concurrency: os.cpus().length - 1 });

const execPromise = promisify(exec);

const pathJoin = (targetPath) => path.join(__dirname, '..', targetPath);
const ensureTrailingSlash = (targetPath) =>
  targetPath.endsWith(path.sep) ? targetPath : targetPath + path.sep;
// prettier-ignore
const compose = (...fns) => (x) => fns.reduceRight((v, fn) => fn(v), x);
const generatePathStr = compose(pathJoin, ensureTrailingSlash);

const progressBar = (progress, total = 100) => {
  const barLength = 40;
  const percentage = (progress / total) * 100;
  const filledBarLength = Math.round((barLength * progress) / total);
  const bar =
    '█'.repeat(filledBarLength) + '-'.repeat(barLength - filledBarLength);

  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`Progress: [${bar}] ${percentage.toFixed(2)}%`);
  if (progress === total) process.stdout.write('\n');
};

class EpubConverter {
  #targetPath;
  #outputPath;

  constructor(targetPath = `${'.' + path.sep}`, outputPath = targetPath) {
    this.#targetPath = generatePathStr(targetPath);
    this.#outputPath = generatePathStr(outputPath);
  }

  #extentionIsPdf(fileName) {
    return path.extname(fileName) === '.pdf';
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
      lower: true,
    });
  }

  async #checkOutputPath() {
    if (this.#targetPath !== this.#outputPath) {
      try {
        await fsp.access(this.#outputPath);
      } catch {
        await fsp.mkdir(this.#outputPath);
      }
    }
  }

  async #renameFile(fileName, toFilename, { isTarget = true } = {}) {
    let target = this.#targetPath + fileName;
    let output = this.#targetPath + toFilename;
    if (!isTarget) {
      target = this.#outputPath + fileName.replace('.pdf', '.epub');
      output = this.#outputPath + toFilename.replace('.pdf', '.epub');
    }
    return await fsp.rename(target, output);
  }

  async #isFile(filePath) {
    return (await fsp.stat(filePath)).isFile();
  }

  async #getFiles() {
    const dir = await fsp.readdir(this.#targetPath);
    const files = [];
    for (const fileName of dir) {
      if (!this.#extentionIsPdf(fileName)) continue;
      if (!this.#isFile(this.#targetPath + fileName)) continue;
      files.push(fileName);
    }
    return files;
  }

  async convert() {
    const files = await this.#getFiles();
    if (files.length === 0) {
      console.log(
        `Target path (${this.#targetPath}) is not include any file with '.pdf' extention`,
      );
      process.exit(1);
    }
    await this.#checkOutputPath();
    let progress = 0;
    for (const fileName of files) {
      const sluggedName = this.#toSlugify(fileName);
      const execQuery = this.#createExecQuery(sluggedName);
      queue.add(async () => {
        await this.#renameFile(fileName, sluggedName);
        await execPromise(execQuery);
        await this.#renameFile(sluggedName, fileName, { isTarget: true });
        await this.#renameFile(sluggedName, fileName, { isTarget: false });
        progressBar(++progress, files.length);
      });
    }
    return new Promise((resolve, reject) => {
      let resolved = false;
      queue
        .drain(() => {
          if (!resolved) resolve();
        })
        .failure((err) => {
          if (!resolved) {
            resolved = true;
            queue.clear();
            reject(err);
          }
        });
    });
  }
}

module.exports = EpubConverter;
