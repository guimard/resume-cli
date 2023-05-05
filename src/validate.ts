import ZSchema from 'z-schema';
// @ts-expect-error z-schema-errors has no definiions
import ZSchemaErrors from 'z-schema-errors';
import { promisify } from 'util';
import { type LoadReturnValue } from 'quaff';

type Resume = object | LoadReturnValue;
interface ValidateArgs {
  resume: Resume;
  schema: object;
}

type ValidateFunc = ({ resume, schema }: ValidateArgs) => Promise<void>;
type _ValidateFunc = (resume: Resume, schema: object) => Promise<void>;

const reporter = ZSchemaErrors.init();
const validator = new ZSchema({});
const _validate: _ValidateFunc = promisify((resume: Resume, schema: object) =>
  validator.validate(resume, schema),
);

// eslint-disable-next-line @typescript-eslint/promise-function-async
const validate: ValidateFunc = ({
  resume,
  schema,
}: ValidateArgs): Promise<void> => {
  try {
    return _validate(resume, schema);
  } catch (errors) {
    throw new Error(reporter.extractMessage({ report: { errors } }));
  }
};

export default validate;
