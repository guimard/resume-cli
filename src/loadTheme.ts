import path from 'path';
import require from './require';
import { type Viewport } from 'puppeteer';
import { fileURLToPath } from 'url';

const _dirname = fileURLToPath(new URL('.', import.meta.url));

interface Theme {
  render: (render: object) => Promise<string>;
  pdfRenderOptions: {
    mediaType: string;
  };
  pdfViewport: Viewport;
}

const cwd = process.cwd();

const tryResolve = (path: string, args?: { paths?: string[] }): string => {
  try {
    const res = require.resolve(path, args);
    return res;
  } catch (e) {
    return '';
  }
};

const loadTheme = (themePath: string): Theme => {
  let _path;
  if (themePath[0] === '.') {
    _path = tryResolve(path.join(cwd, themePath), { paths: [cwd, _dirname] });
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!_path) {
      throw new Error(
        `Theme ${themePath} could not be resolved relative to ${cwd}`,
      );
    }
  }
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!_path) {
    _path = tryResolve(themePath, { paths: [cwd, _dirname] });
  }
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!_path && /^[a-z0-9]/i.test(themePath)) {
    _path = tryResolve(`jsonresume-theme-${themePath}`, { paths: [cwd] });
  }
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!_path) {
    throw new Error(
      `theme path ${themePath} could not be resolved from current working directory`,
    );
    // eslint-disable-next-line no-unreachable
    process.exit(1);
  }
  return require(_path);
};

export default loadTheme;
