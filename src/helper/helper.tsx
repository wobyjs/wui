export function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    // `forEach` works on both readonly and mutable arrays, so no other change is needed.
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}