import { expectAssignable } from 'tsd';
import type { Primitive } from '../../src/types/primitive';

// =============================================
// describe: types/primitive
// =============================================
expectAssignable<Primitive>('a');
expectAssignable<Primitive>(1);
expectAssignable<Primitive>(true);
expectAssignable<Primitive>(1n);
expectAssignable<Primitive>(Symbol('s'));
expectAssignable<Primitive>(null);
expectAssignable<Primitive>(undefined);
