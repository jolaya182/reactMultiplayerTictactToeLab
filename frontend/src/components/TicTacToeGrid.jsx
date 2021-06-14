/* eslint-disable react/prop-types */
// import { set } from 'immer/dist/internal';
import { useState } from 'react';
import Row from './Row';

const TicTacToeGrid = () => {
  const [gridMatrix, setGridMatrix] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);
  const firstPlayer = 'X';
  const secondPlayer = 'O';
  const [currentPlayer, setCurrentPlayer] = useState(firstPlayer);
  const [winner, setWinner] = useState(false);
  const [totalMarks, setTotalMarks] = useState(0);
  const [tie, setTie] = useState(false);

  const isTie = (newCount) => {
    return newCount >= 9;
  };
  const isWinner = () => {
    const winningSquares = [
      [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 }
      ],
      [
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 1, col: 2 }
      ],
      [
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 }
      ],
      [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 2, col: 0 }
      ],
      [
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 2, col: 1 }
      ],
      [
        { row: 0, col: 2 },
        { row: 1, col: 2 },
        { row: 2, col: 2 }
      ],
      [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 }
      ],
      [
        { row: 0, col: 2 },
        { row: 1, col: 1 },
        { row: 2, col: 0 }
      ]
    ];
    let winnerFound = false;
    // eslint-disable-next-line consistent-return
    winningSquares.forEach((winningSquare) => {
      const ws = winningSquare;
      const col0 = ws[0];
      const col1 = ws[1];
      const col2 = ws[2];
      if (
        gridMatrix[col0.row][col0.col] &&
        gridMatrix[col0.row][col0.col] === gridMatrix[col1.row][col1.col] &&
        gridMatrix[col0.row][col0.col] === gridMatrix[col2.row][col2.col]
      ) {
        winnerFound = true;
      }
    });
    return winnerFound;
  };

  const isSquareMarked = ({ row, col }) => {
    return gridMatrix[row][col] !== null;
  };

  const changePlayer = () => {
    setCurrentPlayer(currentPlayer === 'X' ? secondPlayer : firstPlayer);
  };

  const resetGame = () => {
    setGridMatrix([
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ]);
    setCurrentPlayer(firstPlayer);
    setWinner(false);
    setTotalMarks(0);
    setTie(false);
  };

  const markSquare = (cord) => {
    if (isSquareMarked(cord)) return;
    const newGridMatrix = [...gridMatrix];

    newGridMatrix[cord.row][cord.col] = currentPlayer;
    // mark the square
    setGridMatrix(newGridMatrix);
    const newCount = 1 + totalMarks;
    setTotalMarks(newCount);
    if (isWinner()) {
      setWinner(currentPlayer);
      return;
    }
    if (isTie(newCount)) {
      setTie(true);
    }
    changePlayer(currentPlayer);
  };

  return (
    <div className="grid">
      {tie && (
        <>
          <h1>Tie!</h1>
          <button type="button" onClick={resetGame}>
            Reset
          </button>
        </>
      )}
      {winner && (
        <>
          <h1> Winner is : {winner}</h1>
          <button type="button" onClick={resetGame}>
            Reset
          </button>
        </>
      )}
      {gridMatrix &&
        gridMatrix.map((gridRow, indx) => {
          return (
            <Row
              gridRow={gridRow}
              key={`grid${indx}`}
              markSquare={markSquare}
              rowIndx={indx}
            />
          );
        })}
    </div>
  );
};

export default TicTacToeGrid;
