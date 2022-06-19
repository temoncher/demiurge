export function getRandomElement<T>(collection: T[]) {
  return collection[Math.floor(Math.random() * collection.length)]!;
}

export function isTouchDevice() {
  return window.ontouchstart !== undefined;
}
