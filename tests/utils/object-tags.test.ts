import {
  getTag,
  OBJECT_TAG_ARRAY_BUFFER,
  OBJECT_TAG_DATA_VIEW,
  OBJECT_TAG_DATE,
  OBJECT_TAG_ERROR,
  OBJECT_TAG_MAP,
  OBJECT_TAG_REGEXP,
  OBJECT_TAG_SET,
  OBJECT_TAG_WEAK_MAP,
  OBJECT_TAG_WEAK_SET
} from '../../src/utils/object-tags';

describe('utils/object-tags', () => {
  it('returns stable tags for supported built-ins', () => {
    expect(getTag(new Date())).toBe(OBJECT_TAG_DATE);
    expect(getTag(/test/u)).toBe(OBJECT_TAG_REGEXP);
    expect(getTag(new Map())).toBe(OBJECT_TAG_MAP);
    expect(getTag(new Set())).toBe(OBJECT_TAG_SET);
    expect(getTag(new WeakMap())).toBe(OBJECT_TAG_WEAK_MAP);
    expect(getTag(new WeakSet())).toBe(OBJECT_TAG_WEAK_SET);
    expect(getTag(new ArrayBuffer(8))).toBe(OBJECT_TAG_ARRAY_BUFFER);
    expect(getTag(new DataView(new ArrayBuffer(8)))).toBe(OBJECT_TAG_DATA_VIEW);
    expect(getTag(new Error('boom'))).toBe(OBJECT_TAG_ERROR);
  });
});
