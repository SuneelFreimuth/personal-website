export function assertSome<T>(value: T): value is NonNullable<T> {
    if (value !== null && value !== undefined)
        return true;
    console.error(value, 'is not defined');
    throw new Error(`Assertion failed: value is nullish`);
}