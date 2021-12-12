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