class AssertError extends Error {
  constructor(message) {
    super(message)
    this.name = "AssertError"
  }
}

export function assert(condition, message) {
  if (!message) {
    message = `Expected truthy value, actual value: ${condition}`
  }

  if (!condition) {
    throw new AssertError(message)
  }
}

export function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new AssertError(`Expected value: ${expected}, actual value: ${actual}`)
  }
}

export function randomString(length) {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

export function getUrlParams(url) {
  return Object.fromEntries(
      url.split("?")[1].split("&").map(keyValue => keyValue.split("="))
  );
}