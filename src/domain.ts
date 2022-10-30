import { Vector2Tuple } from 'three';

import { Exploration, TerrainType, WrongPositioningError } from './types';

function intersect<M, O, V>(mask: M[][], origin: O[][], mapper: (m: M, o: O | undefined) => V, [offsetRowIndex, offsetColumnIndex]: Vector2Tuple) {
  return mask.map((maskRow, rowIndex) =>
    maskRow.map((maskCol, colIndex) => {
      const tileRowIndex = offsetRowIndex + rowIndex - (mask.length - 1);
      const tileColumnIndex = offsetColumnIndex + colIndex - (maskRow.length - 1);
      const originRow = origin[tileRowIndex]?.[tileColumnIndex];

      return mapper(maskCol, originRow);
    })
  );
}

export function computeErrorsMatrix(mask: Exploration['mask'], tileRows: (TerrainType | null)[][], [rowIndex, columnIndex]: Vector2Tuple) {
  const matrix = intersect(
    mask,
    tileRows,
    (maskValue, tile) => {
      if (!maskValue || tile === null) return false;

      return true;
    },
    [rowIndex, columnIndex]
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return matrix.some((row) => row.some((isError) => isError)) ? matrix : null;
}

// eslint-disable-next-line complexity, import/prefer-default-export
export function applyExploration(
  [rowIndex, columnIndex]: Vector2Tuple,
  mask: Exploration['mask'],
  terrainType: Exploration['type'],
  tileRows: (TerrainType | null)[][]
) {
  const errorMatrix = computeErrorsMatrix(mask, tileRows, [rowIndex, columnIndex]);

  if (errorMatrix) return new WrongPositioningError(errorMatrix);

  const updatedTileRows = tileRows.map((row) => [...row]); // clone

  mask.forEach((maskRow, currentRowIndex) => {
    // eslint-disable-next-line complexity
    maskRow.forEach((maskColumn, currentColumnIndex) => {
      if (maskColumn === 0) return;

      const tileRowIndex = currentRowIndex + rowIndex - (mask.length - 1);
      const tileColumnIndex = currentColumnIndex + columnIndex - (maskRow.length - 1);

      const row = updatedTileRows[tileRowIndex];

      if (
        tileRowIndex >= updatedTileRows.length ||
        (row && tileColumnIndex >= row.length) ||
        tileRowIndex < 0 ||
        tileColumnIndex < 0 ||
        (row && row[tileColumnIndex] !== null)
      )
        return;

      row![tileColumnIndex] = terrainType;
    });
  });

  return updatedTileRows;
}
