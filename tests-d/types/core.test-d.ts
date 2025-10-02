import { expectType } from 'tsd';
import type {
  Predicate,
  Refine,
  ParseResult,
  Schema,
  InferSchema,
} from '../../src/types';

// =============================================
// describe: types/core
// =============================================

// it: Predicate and Refine are callable types
const predString: Predicate<string> = (_x: unknown): _x is string => true;
expectType<Predicate<string>>(predString);

const refineNum: Refine<number, number> = (_x: number): _x is number => true;
expectType<Refine<number, number>>(refineNum);

// it: ParseResult union shape
const validParseResult: ParseResult<number> = { valid: true, value: 1 };
const invalidParseResult: ParseResult<number> = { valid: false };
void validParseResult;
void invalidParseResult;

// it: Schema and InferSchema
const schema = {
  name: (x: unknown): x is string => typeof x === 'string',
} satisfies Schema;
type Inferred = InferSchema<typeof schema>;
const inferredValue: Inferred = { name: 'alice' };
expectType<string>(inferredValue.name);
