import browserSync from 'browser-sync';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import builder from './builder';

const bs = browserSync.create();

interface ServeArgs {
  port: string;
  theme: string;
  silent: string;
  dir: string;
  resumeFilename: string;
}

const reBuildResume = (
  theme: string,
  dir: string,
  resumeFilename: string,
  cb: () => void,
): void => {
  builder(theme, dir, resumeFilename, (err, html) => {
    if (err != null) {
      readline.cursorTo(process.stdout, 0);
      console.log(err);
      html = err;
    }

    fs.writeFile(
      path.join(process.cwd(), dir, 'index.html'),
      html as string,
      (err) => {
        if (err != null) {
          console.log(err);
        }
        cb();
      },
    );
  });
};

const serve = ({
  port,
  theme,
  silent,
  dir,
  resumeFilename,
}: ServeArgs): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  bs.watch(resumeFilename).on('change', () => {
    reBuildResume(theme, dir, resumeFilename, () => {
      bs.reload();
    });
  });
  reBuildResume(theme, dir, resumeFilename, () => {
    bs.init({
      server: dir,
      port: parseInt(port),
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      open: !silent && 'local',
      ui: false,
    });
  });

  console.log('');
  const previewUrl = 'http://localhost:' + port;
  console.log('Preview: ' + previewUrl);
  console.log('Press ctrl-c to stop');
  console.log('');
};

export default serve;
