export function assert(condition, message) {
  if (!condition) {
    throw message ?? ("AssertError: actual value is " + condition)
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