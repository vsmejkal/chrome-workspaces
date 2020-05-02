export function assert(condition) {
  if (!condition) {
    throw "AssertError: actual value is " + condition
  }
}

export function randomString(length) {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}