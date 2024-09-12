# Epub Converter

A Node.js script for converting PDF files to EPUB format using the ebook-convert tool from Calibre.

## Installation

Before using this script, you need to have the `ebook-convert` tool installed on your machine. You can download the latest version of Calibre, which includes the `ebook-convert` tool, from the Calibre website.

Once you have `ebook-convert` installed, you can install this script using npm:

```bash
npm install -g epubconverter
```

## CLI Usage

After installation, you can use the `epubconverter` command from the terminal to convert PDF files to EPUB format.

### Example

```bash
epubconverter --target="./path/to/pdf/files" --output="./path/to/output/directory"
```

### Options

- `--target` (required): The path to the directory containing the PDF files you want to convert.
- `--output` (optional): The path to the output directory where the converted EPUB files will be saved. If not specified, the converted files will be saved in the target directory.

### Examples

```bash
epubconverter --target="./pdfs" --output="./epubs"
```

This will convert all the PDF files in the ./pdfs directory and save the resulting EPUB files in the ./epubs directory

## Programmatic Usage

You can also use this script programmatically in your Node.js projects.

```javascript
const EpubConverter = require('epubconverter');
const converter = new EpubConverter(
  '/path/to/pdf/files',
  '/path/to/output/directory',
);

// convert all the PDF files in the target directory to EPUB format
converter.convert().finally(() => {
  console.log('All done!');
});
```

The convert method returns a Promise that resolves when all the conversions have completed.

## Requirements

- Node.js v16.18 or higher
- `ebook-convert` tool from Calibre

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/timursevimli/epubconventer/blob/main/LICENSE) file for details.
