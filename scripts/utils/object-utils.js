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

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export { deepFreeze, capitalize };