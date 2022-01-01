export class Observable {
    #observers = []

    subscribe(observer) {
        this.#observers.push(observer)
    }

    notify(args) {
        this.#observers.forEach(observer => observer(args))
    }
}
