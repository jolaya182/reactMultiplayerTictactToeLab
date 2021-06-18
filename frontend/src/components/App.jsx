/* eslint-disable consistent-return */
/* eslint-disable react/react-in-jsx-scope */
// @refresh reset
/**
 * @Author: Javier Olaya
 * @fileName: App.jsx
 * @date: 6/18/2021
 * @description: main container for the tictactoe application the makes the api and socket calls
 */
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Form from './Form';
import FetchApi from './FetchApi';
import TicTacToeGrid from './TicTacToeGrid';
import LeaderBoard from './LeaderBoard';

/**
 *  main component that holds all component
 * @return {html}
 */
const App = () => {
  const url = 'http://localhost:3000';
  const [player, setPlayer] = useState(null);
  const [oponent, setOponent] = useState(false);
  const [oponentName, setOponentName] = useState(null);
  const socketRef = useRef();
  const [password, setPassword] = useState();
  const [name, setName] = useState();
  const [login, setlogin] = useState(false);
  const [IAmPlayer, setIAM] = useState(false);
  const [myInfo, setMyInfo] = useState(false);
  const [leaders, setLeaders] = useState(false);
  const [againstComputer, setAgainstComputer] = useState(false);

  const showLeaderBoard = (comingLeaders) => {
    setLeaders(comingLeaders.allLeaders);
  };
  const updateMessage = (action) => {
    let message = '';
    switch (action) {
      case 'waiting':
        message = 'Waiting for another player to log on.';
        break;
      case 'selectedPlayer':
        message = `I am playing against player: ${oponentName}.`;
        break;
      case 'youArePlayer':
        message = `I am the: ${IAmPlayer}.`;
        break;
      case 'computer':
        message = `I am playing against the computer.`;
        break;
      case 'changedLeft':
        message = `My oponent let the room.`;
        break;

      default:
        message = '';
        break;
    }
    return message;
  };

  const connectGame = (incomingLeaders, incomingPlayer) => {
    setPlayer(incomingPlayer.userId);
    setLeaders(incomingLeaders);
    setlogin(true);
    socketRef.current = io.connect('http://localhost:3000', {
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttemps: 10,
      transports: ['websocket'],
      agent: false,
      upgrade: false,
      rejectUnauthorized: false
    });

    socketRef.current.on('receive-leader-board', showLeaderBoard);
    socketRef.current.emit('get-leader-board');

    socketRef.current.emit('join game', name);
    socketRef.current.on('game joined', (gameInfo) => {
      const { oponentPlayer, oponentPlayerName, iAm, id } = gameInfo;
      setMyInfo(id);
      setOponent(oponentPlayer);
      setOponentName(oponentPlayerName);
      setIAM(iAm);
    });
  };

  const disconnect = () => {
    socketRef.current.close();
  };

  const togglePlayerType = () => {
    if (againstComputer) {
      setAgainstComputer(false);
      socketRef.current.emit('join game', myInfo);
    } else {
      setAgainstComputer('computer');
      socketRef.current.emit('inform-player-changed-room', oponent);
      setOponent(false);
    }
  };

  const appendMessage = () => {
    let m = '';
    if (login) m += `${updateMessage('youArePlayer')}`;
    if (login && !oponent) m += ` ${updateMessage('waiting')}`;
    if (login && oponent) m += ` ${updateMessage('selectedPlayer')}`;
    if (login && againstComputer) m += ` ${updateMessage('computer')}`;
    return m;
  };

  useEffect(() => {
    if (!socketRef.current) {
      return;
    }

    socketRef.current.on('receive-leader-board', showLeaderBoard);
    return () => {
      socketRef.current.off('receive-leader-board');
    };
  }, [showLeaderBoard]);

  const submitLogin = (e) => {
    e.preventDefault();
    FetchApi(`${url}/login`, 'POST', connectGame, { name, password });
  };

  const signUp = (e) => {
    e.preventDefault();
    FetchApi(`${url}/create`, 'POST', connectGame, { name, password });
  };

  const addWinner = () => {
    FetchApi(`${url}/win`, 'POST', (f) => f, { id: player });
  };

  const logout = () => {
    setlogin(false);
    setName(false);
    setOponent(false);
    setMyInfo(false);
    disconnect();
  };

  return (
    <div>
      <section className="gameHeader">
        Hi {myInfo && myInfo.playerName} Tic Tac Toe! {appendMessage()}
      </section>
      {!login && (
        <Form
          setName={setName}
          submitLogin={submitLogin}
          setPassword={setPassword}
          signUp={signUp}
        />
      )}
      {login && (
        <div className="appContainer">
          <div className="roww">
            <div className="sideBar">
              <div className="leaderBoard">
                <LeaderBoard leaders={leaders} />
              </div>
              <button type="button" onClick={() => logout()}>
                logout
              </button>
              <button type="button" onClick={() => togglePlayerType()}>
                {againstComputer ? `Human` : `Computer`}
              </button>
            </div>
            <TicTacToeGrid
              socketRef={socketRef}
              oponentId={oponent || againstComputer}
              IAmPlayer={IAmPlayer}
              addWinner={addWinner}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
