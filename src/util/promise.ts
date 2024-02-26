/** A new Promise + the function to resolve it */
export function managedPromise<T>() {
  let resolve: (result: T) => void = () => {}
  const promise = new Promise<T>((r) => { resolve = r })
  return { promise, resolve }
}
