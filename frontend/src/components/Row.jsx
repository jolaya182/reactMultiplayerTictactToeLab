/* eslint-disable react/prop-types */
/**
 * @Author: Javier Olaya
 * @fileName: Row.jsx
 * @date: 6/18/2021
 * @description: contains all the columns for each row in the tic tac toe game
 */
import Column from './Column';

/**
 *
 * @param {Array, func, obj} { gridRow, markSquare, rowIndx }
 * @return {html}
 */
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
