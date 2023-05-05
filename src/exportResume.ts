import renderHTML from './renderHtml';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import loadTheme from './loadTheme';

interface ExportResumeArg {
  resume: object;
  fileName: string;
  theme: string;
  format: string;
}

type ExportResumeCallback = (
  error?: NodeJS.ErrnoException | null | undefined,
  fileName?: string,
  formatToUse?: string,
) => void;

type CreateFunc = (
  resumeJson: object,
  fileName: string,
  theme: string,
  formatToUse: string,
  callback: (error?: NodeJS.ErrnoException | null | undefined) => void,
) => void | Promise<void>;

const exportResume = (
  { resume: resumeJson, fileName, theme, format }: ExportResumeArg,
  callback: ExportResumeCallback,
): void => {
  if (fileName == null || fileName.length === 0) {
    console.error('Please enter a export destination.');
    process.exit(1);
  }

  const fileNameAndFormat = getFileNameAndFormat(fileName, format);
  fileName = fileNameAndFormat.fileName;
  const fileFormatToUse = fileNameAndFormat.fileFormatToUse;
  const formatToUse = '.' + fileFormatToUse;
  if (formatToUse === '.html') {
    void createHtml(resumeJson, fileName, theme, formatToUse, (error) => {
      if (error != null) {
        console.error(error, '`createHtml` errored out');
      }
      callback(error, fileName, formatToUse);
    });
  } else if (formatToUse === '.pdf') {
    void createPdf(resumeJson, fileName, theme, formatToUse, (error) => {
      if (error != null) {
        console.error(error, '`createPdf` errored out');
      }
      callback(error, fileName, formatToUse);
    });
  } else {
    console.error(`JSON Resume does not support the ${formatToUse} format`);
    process.exit(1);
  }
};

const extractFileFormat = (fileName: string): string | null => {
  const dotPos = fileName.lastIndexOf('.');
  if (dotPos === -1) {
    return null;
  }
  return fileName.substring(dotPos + 1).toLowerCase();
};

const getFileNameAndFormat = (
  fileName: string,
  format: string,
): Record<string, string> => {
  const fileFormatFound = extractFileFormat(fileName);
  let fileFormatToUse = format;
  if (
    format != null &&
    format.length > 0 &&
    fileFormatFound != null &&
    format === fileFormatFound
  ) {
    fileName = fileName.substring(0, fileName.lastIndexOf('.'));
  } else if (fileFormatFound != null) {
    fileFormatToUse = fileFormatFound;
    fileName = fileName.substring(0, fileName.lastIndexOf('.'));
  }

  return {
    fileName,
    fileFormatToUse,
  };
};

const createHtml: CreateFunc = async (
  resumeJson,
  fileName,
  themePath,
  format,
  callback,
) => {
  const html = await renderHTML({ resume: resumeJson, themePath });
  const pathToStream = path.resolve(process.cwd(), fileName + format);
  fs.writeFileSync(pathToStream, ''); // workaround for https://github.com/streamich/unionfs/issues/428
  const stream = fs.createWriteStream(pathToStream);
  stream.write(html, () => {
    stream.close(callback);
  });
};

const createPdf: CreateFunc = (
  resumeJson,
  fileName,
  theme,
  format,
  callback,
) => {
  (async () => {
    const themePkg = loadTheme(theme);
    const puppeteerLaunchArgs = [];

    if (process.env.RESUME_PUPPETEER_NO_SANDBOX != null) {
      puppeteerLaunchArgs.push('--no-sandbox');
    }

    const html = await renderHTML({
      resume: resumeJson,
      themePath: theme,
    });
    const browser = await puppeteer.launch({
      args: puppeteerLaunchArgs,
      headless: 'new',
    });
    const page = await browser.newPage();

    await page.emulateMediaType(
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      themePkg.pdfRenderOptions?.mediaType || 'screen',
    );
    await page.goto(
      `data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`,
      { waitUntil: 'networkidle0' },
    );
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (themePkg.pdfViewport) {
      await page.setViewport(themePkg.pdfViewport);
    }
    await page.pdf({
      path: fileName + format,
      format: 'Letter',
      printBackground: true,
      ...themePkg.pdfRenderOptions,
    });

    await browser.close();
  })()
    .then(() => {
      callback();
    })
    .catch(callback);
};

export default exportResume;
