import { Vector2Tuple } from 'three';

import { Exploration, TerrainType, WrongPositioningError } from './types';

// eslint-disable-next-line complexity, import/prefer-default-export
export function applyExploration([rowIndex, columnIndex]: Vector2Tuple, exploration: Exploration, tileRows: (TerrainType | undefined)[][]) {
  const updatedTileRows = tileRows.map((row) => [...row]);

  const halfRowSize = Math.floor(exploration.mask.length / 2);

  const errorCoors: Vector2Tuple[] = [];

  for (let currentRowIndex = 0; currentRowIndex < exploration.mask.length; currentRowIndex++) {
    const maskRow = exploration.mask[currentRowIndex]!;
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
        (row && row[tileColumnIndex] !== undefined)
      ) {
        errorCoors.push([currentRowIndex, currentColumnIndex]);
        continue;
      }

      row![tileColumnIndex] = exploration.type;
    }
  }

  return errorCoors.length > 0 ? new WrongPositioningError(errorCoors) : updatedTileRows;
}
