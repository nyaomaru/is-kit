const OBJECT_CONSTRUCTOR_SOURCE = Function.prototype.toString.call(Object);

/**
 * Checks whether an object is `Object.prototype` from any realm.
 *
 * @param prototype Object to check.
 * @returns Whether `prototype` is an `Object.prototype`.
 */
export const isObjectPrototype = (prototype: object): boolean => {
  const constructor = Object.getOwnPropertyDescriptor(
    prototype,
    'constructor'
  )?.value;

  // WHY: Object.prototype differs across realms, so identity cannot identify
  // it. Its native Object constructor always points back to that prototype.
  return (
    typeof constructor === 'function' &&
    constructor.prototype === prototype &&
    Function.prototype.toString.call(constructor) === OBJECT_CONSTRUCTOR_SOURCE
  );
};
