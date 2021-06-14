/* eslint-disable consistent-return */
/* eslint-disable react/react-in-jsx-scope */
// @refresh reset
import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import immer from 'immer';
// import Hero from './Heros';
import FetchApi from './FetchApi';
import TicTacToeGrid from './TicTacToeGrid';
import Form from './Form';

const App = () => {
  // console.log("results->fetch:",results);

  const [oponent, setOponent] = useState();

  const socketRef = useRef();
  const [password, setPassword] = useState();
  const [name, setName] = useState();

  const connectGame = () => {
    socketRef.current = io.connect('http://localhost:3000', {
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttemps: 10,
      transports: ['websocket'],
      agent: false,
      upgrade: false,
      rejectUnauthorized: false
    });
    socketRef.current.emit('join game', 'javier');
    socketRef.current.on('game joined', (gameInfo) => {
      console.log('returned->gameInfo', gameInfo);
      const { oponentPlayer, iAm } = gameInfo;
      console.log('player is ', gameInfo[iAm]);
      setOponent(oponentPlayer);
      // setPlayer(gameInfo[iAm]);
    });
    const url = 'http://localhost:3000/leaderboard';
    socketRef.current.on('leaderBoardReceived', (leaders) => {
      console.log('here are the leaders', leaders);
    });
    FetchApi(url);
  };

  const disconnect = () => {
    socketRef.current.disconnect();
  };

  const comm = () => {
    console.log('oponent', oponent);
    socketRef.current.emit('send to player', oponent);
  };

  const leaderBoard = () => {
    console.log('geting-leader-board');
    socketRef.current.emit('get-leader-board');
    // setCoord(cor);
  };

  const showMess = (cor) => {
    console.log('got from the player', cor);
    // setCoord(cor);
  };
  const showLeaderBoard = (leaderText) => {
    console.log('showLeaderBoard:-->>', leaderText);
  };

  useEffect(() => {
    console.log('use effect');
    if (!socketRef.current) return;
    socketRef.current.on('receive from player', showMess);
    socketRef.current.on('receive-leader-board', showLeaderBoard);
    return () => {
      socketRef.current.off('receive from player');
      socketRef.current.off('receive-leader-board');
    };
  }, [showMess, showLeaderBoard]);

  const submitLogin = (e) => {
    e.preventDefault();
    console.log('submit', name, password);
    return { name, password };
  };

  return (
    <div>
      {console.log('render')}
      <h1>App!</h1>
      <input
        type="text"
        onChange={(e) => setName(e.target.value)}
        placeholder="name"
      />
      <input
        type="password"
        htmlFor="password"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button type="button" id="password" onClick={submitLogin}>
        Submit
      </button>
      <button type="button" onClick={() => connectGame()}>
        Connect
      </button>
      <button type="button" onClick={() => disconnect()}>
        Disconnect
      </button>
      <button type="button" onClick={() => comm()}>
        Comm
      </button>
      <button type="button" onClick={() => leaderBoard()}>
        leaderBoard
      </button>
      <TicTacToeGrid></TicTacToeGrid>
    </div>
  );
};
export default App;
