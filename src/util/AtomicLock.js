/**
 * Async function executor that calls just one async function at a time.
 */
 export default function AtomicLock() {
    let lock = Promise.resolve();
    
    return async (fn) => {
        lock = lock.then(fn);
        return lock;
    };
}
