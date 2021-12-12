/**
 * Async function executor that calls just one function at a time
 */
 export default function AtomicLock() {
    let lock = Promise.resolve();
    
    return async (fn) => {
        lock = new Promise((resolve) => lock.then(fn).then(resolve, resolve));
        return lock;
    };
}
