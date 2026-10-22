export const INSTALL_TABS = ['pnpm', 'npm', 'yarn', 'bun', 'vlt'] as const;
export type InstallTab = (typeof INSTALL_TABS)[number];
export const INSTALL_COMMANDS: Record<InstallTab, string> = {
  pnpm: 'pnpm add is-kit',
  npm: 'npm i is-kit',
  yarn: 'yarn add is-kit',
  bun: 'bun add is-kit',
  vlt: 'vlt install is-kit'
};

export const USAGE_TABS = [
  'existing-types',
  'property-refinement',
  'exhaustive-unions',
  'open-inputs',
  'handle-unknown-input',
  'compose-guards'
] as const;
export type UsageTab = (typeof USAGE_TABS)[number];

export const USAGE_TAB_LABELS: Record<UsageTab, string> = {
  'existing-types': 'Existing types',
  'property-refinement': 'Property refinement',
  'exhaustive-unions': 'Exhaustive unions',
  'open-inputs': 'Open inputs',
  'handle-unknown-input': 'Handle unknown input',
  'compose-guards': 'Compose guards'
};

export const USAGE_SNIPPETS: Record<UsageTab, string> = {
  'existing-types': `import {
  isNumber,
  isString,
  optionalKey,
  safeParse,
  typedStruct
} from 'is-kit';

type User = {
  id: number;
  name: string;
  nickname?: string;
};

const isUser = typedStruct<User>()({
  id: isNumber,
  name: isString,
  nickname: optionalKey(isString)
});

declare const input: unknown;

const result = safeParse(isUser, input);

if (result.valid) {
  result.value.name.toUpperCase();
}`,
  'property-refinement': `import {
  isString,
  refineDefinedKey,
  refineIndex,
  refineKey
} from 'is-kit';

type Item = {
  value: string | number;
  label?: string;
  tags: readonly (string | number)[];
};

const hasStringValue = refineKey('value', isString);
const hasStringLabel = refineDefinedKey('label', isString);
const hasStringFirstTag = refineKey('tags', refineIndex(0, isString));

declare const items: Item[];
declare const item: Item;

const textItems = items.filter(hasStringValue);
// Array<Item & { value: string }>

if (hasStringLabel(item) && hasStringFirstTag(item)) {
  item.label.toUpperCase();
  item.tags[0].toUpperCase();
}`,
  'exhaustive-unions': `import {
  discriminatedUnion,
  isNumber,
  oneOfValues,
  typedStruct
} from 'is-kit';

type Event =
  | { kind: 'click'; x: number }
  | { kind: 'scroll'; delta: number };

const isClickEvent = typedStruct<Extract<Event, { kind: 'click' }>>()({
  kind: oneOfValues('click'),
  x: isNumber
});

const isScrollEvent = typedStruct<Extract<Event, { kind: 'scroll' }>>()({
  kind: oneOfValues('scroll'),
  delta: isNumber
});

const isEvent = discriminatedUnion<Event>()(
  'kind',
  ['click', 'scroll'],
  { click: isClickEvent, scroll: isScrollEvent }
);

// The values and guard map must cover every Event variant.`,
  'open-inputs': `import { discriminatedUnionWithFallback } from 'is-kit';

type Event =
  | { kind: 'click'; x: number; y: number }
  | { kind: 'scroll'; delta: number };

declare const isClickEvent: (input: unknown) => input is Extract<
  Event,
  { kind: 'click' }
>;
declare const isScrollEvent: (input: unknown) => input is Extract<
  Event,
  { kind: 'scroll' }
>;

const classifyEvent = discriminatedUnionWithFallback<Event>()(
  'kind',
  ['click', 'scroll'],
  { click: isClickEvent, scroll: isScrollEvent },
  {
    tag: 'unknown',
    create: (input, originalKind) => ({ input, originalKind })
  }
);

const result = classifyEvent({ kind: 'hover', target: 'button' });

if (result.valid && result.value.kind === 'unknown') {
  result.value.originalKind; // 'hover'
  result.value.input;
}

classifyEvent({ kind: 'click', x: 'invalid', y: 24 });
// { valid: false }`,
  'handle-unknown-input': `import { isString, safeJsonParse, safeParse } from 'is-kit';

declare const input: unknown;
declare const json: string;

const valueResult = safeParse(isString, input);
const jsonResult = safeJsonParse(json, isString);

if (valueResult.valid) {
  valueResult.value.toUpperCase();
}

if (jsonResult.valid) {
  jsonResult.value.toUpperCase();
}`,
  'compose-guards': `import {
  and,
  isNumber,
  isString,
  not,
  or,
  predicateToRefine
} from 'is-kit';

const isShort = predicateToRefine<string>((s) => s.length <= 3);
const isShortString = and(isString, isShort);

isShortString('ok'); // true
isShortString('toolong'); // false
or(isString, isNumber)('x'); // true
not(isString)(42); // true`
};
