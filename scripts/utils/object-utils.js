function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (
      obj[prop] !== null &&
      (typeof obj[prop] === "object" || typeof obj[prop] === "function")
    ) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
}

export { deepFreeze }