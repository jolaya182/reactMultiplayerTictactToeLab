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
 * @param {object, string, string, func, integer, func} { socketRef, oponentId, IAmPlayer, addWinner, gamePlayer,
  setOponentIdGame }
 * @return {html}
 */
const TicTacToeGrid = ({
  socketRef,
  oponentId,
  IAmPlayer,
  addWinner,
  gamePlayer,
  setOponentIdGame
}) => {
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

  /**
   * helper function to send messages or data to the
   * oponent player and updates their game props
   * @param {array} newGridMatrix
   * @param {string} cp
   * @param {string} winr
   * @param {integer} tm
   * @param {string} t
   */
  const emitToPlayer = (newGridMatrix, cp, winr, tm, t, gp) => {
    socketRef.current.emit(
      'send-grid',
      oponentId,
      newGridMatrix,
      cp,
      winr,
      tm,
      t,
      gp
    );
  };

  /**
   * helper function that accepts messages from the oponent
   * player and updates game props
   * @param {array} grid
   * @param {string} player
   * @param {string} winr
   * @param {string totalM
   * @param {integer} ti
   */
  const receiveOponentsState = (grid, player, winr, totalM, ti, gamPl) => {
    setGridMatrix(grid);
    setCurrentPlayer(player);
    setWinner(winr);
    setTotalMarks(totalM);
    setTie(ti);
    setOponentIdGame(gamPl);
  };

  /**
   * verifys if all squares are filled
   * @param {integer} newCount
   * @return {integer}
   */
  const isTie = (newCount) => {
    return newCount >= 9;
  };

  /**
   * check game state for a winner
   * @return {bool}
   */
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

  /**
   * checks of the space on the grid is taken
   * @param {integer, integer} { row, col }
   * @return {bool}
   */
  const isSquareMarked = ({ row, col }) => {
    return gridMatrix[row][col] !== null;
  };

  /**
   *  switches the players turn
   * @return {string}
   */
  const changePlayer = () => {
    const newPlayer = currentPlayer === 'X' ? secondPlayer : firstPlayer;
    setCurrentPlayer(newPlayer);
    return newPlayer;
  };

  /**
   * sets all the games props to defaut values
   */
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
    emitToPlayer(newGridMatrix, firstPlayer, false, 0, false, false);
  };

  /**
   * generate random coordinate
   *
   * @return {obj}
   */
  const getNewPosition = () => {
    const min = 0;
    const max = 3;
    const rowCordinate = Math.floor(Math.random() * (max - min) + min);
    const colCordinate = Math.floor(Math.random() * (max - min) + min);
    return { row: rowCordinate, col: colCordinate };
  };

  /**
   * this function acts as the computer playing the game by
   * placing random marks on availables grid spaces
   * @param {obj} cord
   * @param {string} newPlayer
   * @param {integer} newCount
   * @return
   */
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

  /**
   * fires when the player clicks on the square to mark it
   * @param {obj} cord
   * @return
   */
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
      emitToPlayer(
        newGridMatrix,
        currentPlayer,
        currentPlayer,
        newCount,
        tie,
        gamePlayer
      );
      return;
    }
    if (isTie(newCount)) {
      setTie(true);
      return;
    }

    // send the grid to the oponent
    const newPlayer = changePlayer(currentPlayer);
    if (oponentId !== 'computer') {
      emitToPlayer(newGridMatrix, newPlayer, winner, newCount, tie, gamePlayer);
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
