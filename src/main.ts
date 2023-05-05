#!/usr/bin/env node

import init from './init';
import getResume from './getResume';
import getSchema from './getSchema';
import validate from './validate';
import { version } from './package.json' assert { type: 'json' };
import exportResume from './exportResume';
import serve from './serve';
import { program } from 'commander';
import chalk from 'chalk';
import path from 'path';

interface ResumeOptions {
  resume: string;
  schema: string;
  theme: string;
  format: string;
  port: string;
  dir: string;
  silent: string;
}

const normalizeTheme = (value: string, defaultValue: string): string => {
  const theme = value.length > 0 ? value : defaultValue;
  if (theme[0] === '.') {
    return theme;
  }
  return /jsonresume-theme-.*/.test(theme)
    ? theme
    : `jsonresume-theme-${theme}`;
};

void (async () => {
  program
    .name('resume')
    .usage('[command] [options]')
    .version(version)
    .option(
      '-F, --force',
      'Used by `publish` and `export` - bypasses schema testing.',
    )
    .option(
      '-t, --theme <theme name>',
      'Specify theme used by `export` and `serve` or specify a path starting with . (use . for current directory or ../some/other/dir)',
      normalizeTheme,
      'jsonresume-theme-even',
    )
    .option('-f, --format <file type extension>', 'Used by `export`.')
    .option(
      '-r, --resume <resume filename>',
      "path to the resume in json format. Use '-' to read from stdin",
      'resume.json',
    )
    .option('-p, --port <port>', 'Used by `serve` (default: 4000)', '4000')
    .option(
      '-s, --silent',
      'Used by `serve` to tell it if open browser auto or not.',
      false,
    )
    .option(
      '-d, --dir <path>',
      'Used by `serve` to indicate a public directory path.',
      'public',
    )
    .option(
      '--schema <relativePath>',
      'Used by `validate` to validate against a custom schema.',
    );

  const opts: ResumeOptions = program.opts();
  program
    .command('init')
    .description('Initialize a resume.json file')
    .action(async () => {
      await init({ resumePath: opts.resume });
    });

  program
    .command('validate')
    .description("Validate your resume's schema")
    .action(async () => {
      const resume = await getResume({ path: opts.resume });
      const schema = await getSchema({ path: opts.schema });
      try {
        await validate({
          resume,
          schema,
        });
      } catch (e) {
        console.error(e);
        process.exitCode = 1;
      }
    });

  program
    .command('export [fileName]')
    .description(
      'Export locally to .html or .pdf. Supply a --format <file format> flag and argument to specify export format.',
    )
    .action(async (fileName) => {
      const resume = await getResume({ path: opts.resume });
      exportResume({ ...opts, resume, fileName }, (_err, fileName, format) => {
        console.log(
          chalk.green(
            '\nDone! Find your new',
            format,
            'resume at:\n',
            path.resolve(
              process.cwd(),
              (fileName as string) + (format as string),
            ),
          ),
        );
      });
    });

  program
    .command('serve')
    .description('Serve resume at http://localhost:4000/')
    .action(async () => {
      serve({
        ...opts,
        resumeFilename: opts.resume,
      });
    });

  await program.parseAsync(process.argv);

  // @ts-expect-error rawArgs exists
  if (program.rawArgs.length < 3) {
    console.log(chalk.cyan('resume-cli:'), 'https://jsonresume.org', '\n');
    program.help();
  }
})();
