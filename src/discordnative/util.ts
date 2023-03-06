export const stub = (name: string) => () => `stub! ${name}`;
export const todo =
    (name: string) =>
    (...args: any) =>
        console.log("todo!:", name, ...args);
