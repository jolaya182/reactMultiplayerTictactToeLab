/* eslint-disable react/prop-types */
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
