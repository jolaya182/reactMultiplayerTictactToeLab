/* eslint-disable react/prop-types */
import Row from './Row';

const TicTacToeGrid = ({ gridMatrix }) => {
  return (
    <div className="grid">
      {gridMatrix &&
        gridMatrix.map((gridRow, indx) => {
          return <Row gridRow={gridRow[indx]} />;
        })}
    </div>
  );
};

export default TicTacToeGrid;
