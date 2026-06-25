import { expectType } from 'tsd';
import { arrayOf, lazy, typedStruct } from '@/index';
import { isString } from '@/core/primitive';
import type { Predicate } from '@/types';

// =============================================
// describe: lazy
// =============================================
// it: preserves the factory predicate type for recursive structures
type Tree = {
  readonly value: string;
  readonly children: readonly Tree[];
};

const isTree: Predicate<Tree> = lazy(() =>
  typedStruct<Tree>()({
    value: isString,
    children: arrayOf(isTree)
  })
);

expectType<Predicate<Tree>>(isTree);
expectType<Predicate<string>>(lazy(() => isString));
