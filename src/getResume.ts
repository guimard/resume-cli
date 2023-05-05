import yaml from 'js-yaml';
import { lookup } from 'mime-types';
import fs from 'fs';
import { resolve as resolvePath } from 'path';
import { type LoadReturnValue, load as quaff } from 'quaff';
import streamToString from 'stream-to-string';

type AcceptedMimeTypes = 'text/yaml' | 'application/json';

export interface getResumeOptions {
  path: string;
  mime?: AcceptedMimeTypes;
}

const parsers: Record<AcceptedMimeTypes, (s: string) => object> = {
  'text/yaml': (s: string) => yaml.load(s) as object,
  'application/json': (s: string) => JSON.parse(s),
};

const getResume = async ({
  path,
  mime,
}: getResumeOptions): Promise<LoadReturnValue | object> => {
  let input: NodeJS.ReadStream | fs.ReadStream | null = null;
  if (path === '-') {
    if (mime == null) mime = lookup('.json') as AcceptedMimeTypes;
    input = process.stdin;
  } else if (path.length > 0 && fs.statSync(path).isDirectory()) {
    return await quaff(path);
  }
  if (input == null) {
    if (mime == null) mime = lookup(path) as AcceptedMimeTypes;
    input = fs.createReadStream(resolvePath(process.cwd(), path));
  }
  if (input == null) {
    throw new Error('resume could not be gotten from path or stdin');
  }
  const resumeString = await streamToString(input);
  const parser = parsers[mime as AcceptedMimeTypes];
  return parser(resumeString);
};

export default getResume;
