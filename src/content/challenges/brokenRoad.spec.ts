import { describe, expect, it } from 'vitest';

import { tt } from '@/types';

import { brokenRoad } from './brokenRoad';

const { e, F } = tt;

describe(`[Challenge] ${brokenRoad.name}`, () => {
  it('should count single line', () => {
    const points = brokenRoad.calculatePoints({
      timeLeft: 0,
      tiles: [
        [F, e, e],
        [e, F, e],
        [e, e, F],
      ],
    });

    expect(points).toEqual(3);
  });
  it('should count multiple lines', () => {
    const points = brokenRoad.calculatePoints({
      timeLeft: 0,
      tiles: [
        [F, e, e],
        [e, F, e],
        [F, e, F],
      ],
    });

    expect(points).toEqual(6);
  });
  it('should not count unfinished lines', () => {
    const points = brokenRoad.calculatePoints({
      timeLeft: 0,
      tiles: [
        [F, e, e],
        [F, e, e],
        [e, e, F],
      ],
    });

    expect(points).toEqual(0);
  });
  it('should not count top right lines', () => {
    const points = brokenRoad.calculatePoints({
      timeLeft: 0,
      tiles: [
        [e, F, F],
        [e, e, F],
        [e, e, e],
      ],
    });

    expect(points).toEqual(0);
  });
});
