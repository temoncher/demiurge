import { Vector2Tuple } from 'three';

import { Exploration, TerrainType, WrongPositioningError } from './types';

function intersect<M, O, V>(
  mask: M[][],
  origin: O[][],
  mapper: (m: M, o: O | undefined) => V,
  [offsetRowIndex, offsetColumnIndex]: Vector2Tuple = [0, 0]
) {
  const halfRowSize = Math.floor(mask.length / 2);

  return mask.map((mRow, mRowIndex) =>
    mRow.map((mCol, mColIndex) => {
      const halfColumnSize = Math.floor(mRow.length / 2);
      const originRow = origin[mRowIndex + offsetRowIndex - halfRowSize]?.[mColIndex + offsetColumnIndex - halfColumnSize];

      return mapper(mCol, originRow);
    })
  );
}

// eslint-disable-next-line complexity, import/prefer-default-export
export function applyExploration(
  [rowIndex, columnIndex]: Vector2Tuple,
  mask: Exploration['mask'],
  terrainType: Exploration['type'],
  tileRows: (TerrainType | null)[][]
) {
  const updatedTileRows = tileRows.map((row) => [...row]);

  const halfRowSize = Math.floor(mask.length / 2);

  for (let currentRowIndex = 0; currentRowIndex < mask.length; currentRowIndex++) {
    const maskRow = mask[currentRowIndex]!;
    const halfColumnSize = Math.floor(maskRow.length / 2);

    for (let currentColumnIndex = 0; currentColumnIndex < maskRow.length; currentColumnIndex++) {
      const maskColumn = maskRow[currentColumnIndex]!;

      if (!maskColumn) continue;

      const tileRowIndex = currentRowIndex + rowIndex - halfRowSize;
      const tileColumnIndex = currentColumnIndex + columnIndex - halfColumnSize;

      const row = updatedTileRows[tileRowIndex];

      if (
        tileRowIndex >= updatedTileRows.length ||
        (row && tileColumnIndex >= row.length) ||
        tileRowIndex < 0 ||
        tileColumnIndex < 0 ||
        (row && row[tileColumnIndex] !== null)
      ) {
        continue;
      }

      row![tileColumnIndex] = terrainType;
    }
  }

  const errorMatrix = intersect(
    mask,
    tileRows,
    (m, tr) => {
      if (!m) return false;

      if (tr !== null) return true;

      return false;
    },
    [rowIndex, columnIndex]
  );

  return errorMatrix.some((row) => row.some((isError) => isError)) ? new WrongPositioningError(errorMatrix) : updatedTileRows;
}
