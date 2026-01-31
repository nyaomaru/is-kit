import { expectType } from 'tsd';
import { toBooleanPredicates } from '../../src/utils';
import { define } from '../../src/core';
import type { Refine } from '../../src/types';

// =============================================
// describe: toBooleanPredicates
// =============================================
// it: accepts guards and refinements with narrower input types
const isLiteralA = define<'a'>(
  (candidate): candidate is 'a' => candidate === 'a'
);
const refineToString: Refine<string | number, string> = (
  value
): value is string => typeof value === 'string';

const predicatesFromGuards = toBooleanPredicates([isLiteralA, refineToString]);
expectType<ReadonlyArray<(value: unknown) => boolean>>(predicatesFromGuards);

// it: accepts plain boolean predicates with narrower inputs
const isNonEmptyString = (value: string) => value.length > 0;
const predicatesFromBooleans = toBooleanPredicates([isNonEmptyString]);
expectType<ReadonlyArray<(value: unknown) => boolean>>(predicatesFromBooleans);

// it: preserves readonly inputs
const literalGuards = [isLiteralA] as const;
const readonlyPredicates = toBooleanPredicates(literalGuards);
expectType<ReadonlyArray<(value: unknown) => boolean>>(readonlyPredicates);

// it: results are usable as boolean-returning predicates
expectType<boolean>(readonlyPredicates[0]('a'));
