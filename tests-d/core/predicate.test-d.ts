import { expectType } from 'tsd';
import { predicateToRefine } from '../../src/core/predicate';
import type { Refine } from '../../src/types';

// =============================================
// describe: predicateToRefine (types)
// =============================================
expectType<Refine<number, number>>(predicateToRefine<number>(() => true));

