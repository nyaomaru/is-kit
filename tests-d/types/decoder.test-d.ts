import { expectNotAssignable, expectType } from 'tsd';
import type { Decoder, ParseResult } from '@/types';

// =============================================
// describe: Decoder
// =============================================
// it: models an explicit input-to-output transformation
// Note: Numeric syntax policy belongs to the concrete decoder, not the contract.
const stringToNumber: Decoder<string, number> = (input) => {
  if (input.trim() === '') return { valid: false };

  const value = Number(input);
  return Number.isFinite(value) ? { valid: true, value } : { valid: false };
};

expectType<Decoder<string, number>>(stringToNumber);
expectType<ParseResult<number>>(stringToNumber('42'));
expectNotAssignable<Parameters<typeof stringToNumber>[0]>(42);

// it: composes by passing successful output to the next decoder
const numberToBoolean: Decoder<number, boolean> = (input) => ({
  valid: true,
  value: input !== 0
});

const stringToBoolean: Decoder<string, boolean> = (input) => {
  const numberResult = stringToNumber(input);
  return numberResult.valid
    ? numberToBoolean(numberResult.value)
    : numberResult;
};

expectType<ParseResult<boolean>>(stringToBoolean('1'));
expectNotAssignable<Parameters<typeof stringToBoolean>[0]>(true);
