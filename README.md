# Epub Converter
A Node.js script for converting PDF files to EPUB format using the ebook-convert tool from Calibre.

## Installation
Before using this script, you need to have the ebook-convert tool installed on your machine. You can download the latest version of Calibre, which includes the ebook-convert tool, from the Calibre website.

Once you have ebook-convert installed, you can install this script using npm:

```bash
npm install epubconventer
```

## Usage
To use this script, require the EpubConverter class and create a new instance with the path to the directory containing the PDF files you want to convert, and optionally a path to the output directory:

```javascript
const EpubConverter = require('epubconverter');
const converter = new EpubConverter('/path/to/pdf/files', '/path/to/output/directory');
```
Then call the convert method to convert all the PDF files in the target directory to EPUB format:

```javascript
converter.convert();
```
The convert method returns a Promise that resolves when all the conversions have completed.

License
This script is licensed under the MIT License.pub conventer
