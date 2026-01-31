import { expectType } from 'tsd';
import { toBooleanPredicates } from '../../src/utils';
import { define } from '../../src/core';
import type { Refine } from '../../src/types';

// =============================================
// describe: toBooleanPredicates
// =============================================
// it: accepts guards and refinements sharing the same input type
const isStringOrNumber = define<string | number>(
  (value): value is string | number =>
    typeof value === 'string' || typeof value === 'number'
);
const refineToString: Refine<string | number, string> = (
  value
): value is string => typeof value === 'string';
const refineToNumber: Refine<string | number, number> = (
  value
): value is number => typeof value === 'number';

const predicatesFromGuards = toBooleanPredicates([
  isStringOrNumber,
  refineToString,
  refineToNumber
]);
expectType<ReadonlyArray<(value: string | number) => boolean>>(
  predicatesFromGuards
);

// it: preserves readonly inputs
const literalGuards = [refineToString, refineToNumber] as const;
const readonlyPredicates = toBooleanPredicates(literalGuards);
expectType<ReadonlyArray<(value: string | number) => boolean>>(
  readonlyPredicates
);

// it: results are usable as boolean-returning predicates
expectType<boolean>(readonlyPredicates[0]('a'));
