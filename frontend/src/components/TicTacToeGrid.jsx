/* eslint-disable no-unused-expressions */
/* eslint-disable react/prop-types */
/**
 * @Author: Javier Olaya
 * @fileName: TicTacToeGrid.jsx
 * @date: 6/18/2021
 * @description: handles all the business logic of the tic tac toe application
 */
import { useEffect, useState } from 'react';
import Row from './Row';

/**
 * @param {object, string, string, func} { socketRef, oponentId, IAmPlayer, addWinner }
 * @return {html}
 */
const TicTacToeGrid = ({ socketRef, oponentId, IAmPlayer, addWinner }) => {
  const [gridMatrix, setGridMatrix] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]);

  const firstPlayer = 'X';
  const secondPlayer = 'O';
  const iAmPlayer = IAmPlayer === 'firstPlayer' ? firstPlayer : secondPlayer;
  const [currentPlayer, setCurrentPlayer] = useState(firstPlayer);
  const [winner, setWinner] = useState(false);
  const [totalMarks, setTotalMarks] = useState(0);
  const [tie, setTie] = useState(false);

  const emitToPlayer = (newGridMatrix, cp, winr, tm, t) => {
    socketRef.current.emit(
      'send-grid',
      oponentId,
      newGridMatrix,
      cp,
      winr,
      tm,
      t
    );
  };
  const receiveOponentsState = (grid, player, winr, totalM, ti) => {
    setGridMatrix(grid);
    setCurrentPlayer(player);
    setWinner(winr);
    setTotalMarks(totalM);
    setTie(ti);
  };

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
    const newPlayer = currentPlayer === 'X' ? secondPlayer : firstPlayer;
    setCurrentPlayer(newPlayer);
    return newPlayer;
  };

  const resetGame = () => {
    const newGridMatrix = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];
    setGridMatrix(newGridMatrix);
    setCurrentPlayer(firstPlayer);
    setWinner(false);
    setTotalMarks(0);
    setTie(false);
    emitToPlayer(newGridMatrix, firstPlayer, false, 0, false);
  };

  // generate random coordinate
  const getNewPosition = () => {
    const min = 0;
    const max = 3;
    const rowCordinate = Math.floor(Math.random() * (max - min) + min);
    const colCordinate = Math.floor(Math.random() * (max - min) + min);
    return { row: rowCordinate, col: colCordinate };
  };

  const computerMark = (cord, newPlayer, newCount) => {
    const newGridMatrix = [...gridMatrix];
    newGridMatrix[cord.row][cord.col] = newPlayer;

    // mark the square
    setGridMatrix(newGridMatrix);
    newCount = 1 + newCount;
    setTotalMarks(newCount);
    if (isWinner()) {
      setWinner(newPlayer);
      return;
    }
    if (isTie(newCount)) {
      setTie(true);
      return;
    }
    // send the grid to the oponent
    setCurrentPlayer(newPlayer === 'X' ? secondPlayer : firstPlayer);
  };

  const markSquare = (cord) => {
    if (oponentId !== 'computer' && iAmPlayer !== currentPlayer) return;
    if (isSquareMarked(cord)) return;

    const newGridMatrix = [...gridMatrix];
    newGridMatrix[cord.row][cord.col] = currentPlayer;
    // mark the square
    setGridMatrix(newGridMatrix);

    const newCount = 1 + totalMarks;
    setTotalMarks(newCount);
    if (isWinner()) {
      setWinner(currentPlayer);
      addWinner();
      emitToPlayer(newGridMatrix, currentPlayer, currentPlayer, newCount, tie);
      return;
    }
    if (isTie(newCount)) {
      setTie(true);
      return;
    }

    // send the grid to the oponent
    const newPlayer = changePlayer(currentPlayer);
    if (oponentId !== 'computer') {
      emitToPlayer(newGridMatrix, newPlayer, winner, newCount, tie);
    } else {
      // eslint-disable-next-line no-lonely-if
      if (newPlayer === secondPlayer && newCount < 8) {
        let position = getNewPosition();
        while (isSquareMarked(position)) {
          position = getNewPosition();
        }
        computerMark(position, newPlayer, newCount);
      }
    }
  };

  useEffect(() => {
    socketRef.current.on('receive-grid', receiveOponentsState);
    () => {
      socketRef.current.off('receive-grid');
    };
  }, [receiveOponentsState]);

  return (
    <div className="grid">
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
      {winner && (
        <>
          <div> Winner is : {winner}</div>
          <button type="button" onClick={resetGame}>
            Reset
          </button>
        </>
      )}
      {tie && (
        <>
          <div className="leader">Tie!</div>
          <button type="button" onClick={resetGame}>
            Reset
          </button>
        </>
      )}
    </div>
  );
};

export default TicTacToeGrid;
