import fs from 'fs';
import chalk from 'chalk';
import renderHTML from './renderHtml';
import request from 'superagent';
import require from './require';
const themeServer =
  process.env.THEME_SERVER ?? 'https://registry.jsonresume.org/theme/';

type Callback = (err: string | null, html?: string) => void;

const denormalizeTheme = (value: string): string => {
  if (value.includes('jsonresume-theme-'))
    return (value.match(/jsonresume-theme-(.*)/) as string[])[1];
  return value;
};

const dlError = (callback: Callback, e?: string): void => {
  // eslint-disable-next-line n/no-callback-literal
  callback(
    `There was an error downloading your generated html resume from our server${
      e != null ? ': ' + e : ''
    }`,
  );
};

const sendExportHTML = (
  resumeJson: object,
  theme: string,
  callback: Callback,
): void => {
  console.log(resumeJson, theme);
  console.log('Requesting theme from server...');

  request
    .post(themeServer + denormalizeTheme(theme))
    .send({
      resume: resumeJson,
    })
    .set('Accept', 'application/json')
    .end((err, response) => {
      if (err != null && err.length > 0) {
        dlError(callback, err);
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      } else if (response.text) {
        callback(null, response.text);
      } else {
        dlError(callback);
      }
    });
};

const resumeBuilder = (
  theme: string,
  dir: string,
  resumeFilename: string,
  cb: Callback,
): void => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  fs.readFile(resumeFilename, async (err, resumeJson) => {
    let result;
    if (err != null) {
      console.log(chalk.yellow('Could not find:'), resumeFilename);
      console.log(
        chalk.cyan('Using example resume.json from resume-schema instead...'),
      );
      result = require('resume-schema/sample.resume.json');
    } else {
      try {
        // todo: test resume schema
        result = JSON.parse(resumeJson.toString());
      } catch (e) {
        // eslint-disable-next-line n/no-callback-literal
        cb(`Parse error: ${resumeFilename}`);
      }
    }

    try {
      const html = await renderHTML({ resume: result, themePath: theme });
      cb(null, html);
    } catch (err) {
      console.log(err);
      console.log(
        chalk.yellow('Could not run the render function from local theme.'),
      );
      sendExportHTML(result, theme, cb);
    }
  });
};

export default resumeBuilder;
