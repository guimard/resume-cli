import fs from 'fs';
import require from './require';

interface getSchemaArgs {
  path?: string;
}

const getSchema = async ({ path }: getSchemaArgs): Promise<object> => {
  if (path == null) {
    return require('resume-schema/schema.json');
  }
  return JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }).toString());
};

export default getSchema;
