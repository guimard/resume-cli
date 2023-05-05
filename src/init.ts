import fs from 'fs';
import chalk from 'chalk';
import yesno from 'yesno';
import { set } from 'object-path-immutable';
import read from 'read';
import require from './require';

interface InitArgs {
  resumePath: string;
}

const init = async ({ resumePath }: InitArgs): Promise<void> => {
  if (fs.existsSync(resumePath)) {
    console.log(
      chalk.yellow('There is already a resume.json file in this directory.'),
    );
    if (!(await yesno({ question: 'Do you want to override?' }))) {
      return;
    }
  }
  console.log(`This utility will generate a file at ${resumePath}.`);
  console.log(
    'Fill out your name and email to get started, or leave the fields blank.',
  );
  console.log('All fields are optional.\n');
  console.log('Press ^C at any time to quit.');

  // eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression
  const name = await read(
    {
      prompt: 'name: ',
    },
    () => {},
  );
  // eslint-disable-next-line @typescript-eslint/await-thenable, @typescript-eslint/no-confusing-void-expression
  const email = await read(
    {
      prompt: 'email: ',
    },
    () => {},
  );

  const personalizedResume = Object.entries({
    name,
    email,
  }).reduce(
    (acc, [key, value]) => set(acc, `basics.${key}`, value),
    require('resume-schema/sample.resume.json'),
  );
  fs.writeFileSync(
    resumePath,
    JSON.stringify(personalizedResume, undefined, 2),
  );

  console.log(`Your resume has been created at ${resumePath}`);
  console.log('');
  console.log(
    'To generate a formatted .html .md .txt or .pdf resume from your resume',
  );
  console.log(
    'type: `resume export [someFileName]` including file extension eg: `resume export myresume.html`',
  );
  console.log(
    '\nYou can optionally specify an available theme for html and pdf resumes using the --theme flag.',
  );
  console.log('Example: `resume export myresume.pdf --theme even`');
  console.log('Or simply type: `resume export` and follow the prompts.');
  console.log('');
};

export default init;
