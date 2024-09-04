export function isObject(o: any) {
  return o !== null && typeof o === "object" && Array.isArray(o) === false;
}

export function isPlainObject(o: any) {
  return Object.prototype.toString.call(o) === "[object Object]";
}

export function isNumber(n: any) {
  return typeof n === "number" && n - n === 0;
}
