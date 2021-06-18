/* eslint-disable react/prop-types */
/**
 * @Author: Javier Olaya
 * @fileName: Column.jsx
 * @date: 6/18/2021
 * @description: individual box for the tic tac toe box
 */
/**
 *
 * @param {string, func, obj} { letter, markSquare, coord }
 * @return {html}
 */
const Column = ({ letter, markSquare, coord }) => {
  return (
    <div
      className="colu"
      onClick={() => {
        markSquare({ row: coord.row, col: coord.col });
      }}
    >
      {letter}
    </div>
  );
};
export default Column;
