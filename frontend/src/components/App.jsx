/* eslint-disable consistent-return */
/* eslint-disable react/react-in-jsx-scope */
// @refresh reset
import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import immer from 'immer';
// import Hero from './Heros';
// import FetchApi from './FetchApi';
import Form from './Form';

const App = () => {
  // const url = 'http://localhost:3000';

  const [oponent, setOponent] = useState();
  const [player, setPlayer] = useState();
  const [coord, setCoord] = useState();
  const socketRef = useRef();

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
  };

  const disconnect = () => {
    socketRef.current.disconnect();
  };

  const comm = () => {
    console.log('oponent', oponent);
    socketRef.current.emit('send to player', oponent);
  };

  // const showMess = (cor) =>
  //   useCallback(() => {
  //     console.log('got from the player', cor);
  //     setCoord(cor);
  //   }, [setCoord]);

  const showMess = (cor) => {
    console.log('got from the player', cor);
    setCoord(cor);
  };

  useEffect(() => {
    console.log('use effect');
    if (!socketRef.current) return;
    socketRef.current.on('receive from player', showMess);

    return () => socketRef.current.off('receive from player');
  }, [showMess]);

  return (
    <div>
      {console.log('render')}
      {/* <Hero /> */}
      <h1>App!</h1>
      <button type="button" onClick={() => connectGame()}>
        Connect
      </button>
      <button type="button" onClick={() => disconnect()}>
        Disconnect
      </button>
      <button type="button" onClick={() => comm()}>
        Comm
      </button>
    </div>
  );
};
export default App;
