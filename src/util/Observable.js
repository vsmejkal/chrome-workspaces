import Action from "../Action.js"
import { assert } from "./assert.js"

export default class Observable {
    /// Map<eventName, observer[]>
    static observers = new Map()

    constructor(eventName) {
        assert(typeof eventName === "string", "Observable must have a unique name")
        this.eventName = eventName
        Observable.observers.set(eventName, [])
    }

    subscribe(observer) {
        Observable.observers.get(this.eventName).push(observer)
    }

    async notify(args) {
        if (globalThis.isBackground) {
            Observable.notify(this.eventName, args)
        } else {
            await Action.notifyBackgroundObservers(this.eventName, args)
        }
    }

    static notify(eventName, args) {
        Observable.observers.get(eventName)?.forEach(observer => observer(args))
    }
}
