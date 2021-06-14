/* eslint-disable react/prop-types */

import Column from './Column';

const Row = ({ gridRow, markSquare, rowIndx }) => {
  return (
    <div className="roww">
      {gridRow &&
        gridRow.map((letter, colIndx) => {
          return (
            <Column
              letter={letter}
              key={`row${colIndx}`}
              markSquare={markSquare}
              coord={{ row: rowIndx, col: colIndx }}
            />
          );
        })}
    </div>
  );
};
export default Row;
