import { Challenge } from '@/types';

const POINTS_PER_ROW = 3;

/**
 * @example
 *    [
 *      [F, e, e],
 *      [e, F, e],
 *      [e, e, F],
 *    ] = POINTS_PER_ROW * 1
 *
 *    [
 *      [F, e, e],
 *      [F, F, e],
 *      [e, F, F],
 *    ] = POINTS_PER_ROW * 2
 *
 *    [
 *      [F, e, e],
 *      [F, F, e],
 *      [F, F, F],
 *    ] = POINTS_PER_ROW * 3
 *
 *    [
 *      [F, F, e],
 *      [F, F, F],
 *      [F, F, F],
 *    ] = POINTS_PER_ROW * 3
 *
 *    [
 *      [F, F, F],
 *      [F, F, F],
 *      [F, F, F],
 *    ] = POINTS_PER_ROW * 3
 */
export const brokenRoad: Challenge = {
  name: 'Broken road',
  text: `Receive ${POINTS_PER_ROW} for each diagonal that is entirely filled cells and touches the left and bottom edges of the map`,
  calculatePoints: (ctx) => {
    const offsets = Array.from({ length: ctx.tiles.length }, (unk, offset) => offset);

    const successfulOffsets = offsets.filter((offset) => {
      let next = ctx.tiles[offset]?.[0];
      let current = 0;

      if (next === undefined) return false;

      while (next !== undefined) {
        if (next === null) return false;

        current++;
        next = ctx.tiles[offset + current]?.[current];
      }

      return true;
    });

    console.log('calculated', successfulOffsets.length * POINTS_PER_ROW, successfulOffsets);

    return successfulOffsets.length * POINTS_PER_ROW;
  },
};
