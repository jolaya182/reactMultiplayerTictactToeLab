/* eslint-disable consistent-return */
/* eslint-disable react/react-in-jsx-scope */
// @refresh reset
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import immer from 'immer';
import Form from './Form';
import FetchApi from './FetchApi';
import TicTacToeGrid from './TicTacToeGrid';
import LeaderBoard from './LeaderBoard';

const App = () => {
  const url = 'http://localhost:3000/login';
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
    console.log('geting-leader-board', comingLeaders);
    // setLeaders(comingLeaders);
  };
  const updateMessage = (action) => {
    let message = '';
    switch (action) {
      case 'waiting':
        message = 'Waiting for another player to log on.';
        break;
      case 'selectedPlayer':
        message = `You are playing against player: ${oponentName}.`;
        break;
      case 'youArePlayer':
        message = `I am the: ${IAmPlayer}.`;
        break;
      case 'computer':
        message = `I am playing against the computer.`;
        break;
      case 'changedLeft':
        message = `Your oponent let the room.`;
        break;

      default:
        message = '';
        break;
    }
    return message;
  };

  const connectGame = (incomingLeaders) => {
    setLeaders(incomingLeaders);
    setlogin(true);
    console.log('connected the game');
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

    console.log('name', name);
    socketRef.current.emit('join game', name);
    socketRef.current.on('game joined', (gameInfo) => {
      console.log('returned --->gameInfo', gameInfo);
      const { oponentPlayer, oponentPlayerName, iAm, id } = gameInfo;
      console.log(`received oponent --> ${oponentPlayer}`);
      console.log('player is ', iAm);
      setMyInfo(id);
      setOponent(oponentPlayer);
      setOponentName(oponentPlayerName);
      setIAM(iAm);
    });
    socketRef.current.on('player-left', () => {
      // setOponent(false);
      // setIAM('firstPlayer');
    });
    socketRef.current.on('disconnect', () => {
      console.log('socketRef id', socketRef.current.id); // undefined
    });
  };

  const disconnect = () => {
    socketRef.current.close();
  };

  const togglePlayerType = () => {
    if (againstComputer) {
      console.log('toggling', againstComputer);
      setAgainstComputer(false);
      socketRef.current.emit('join game', myInfo);
      // connectGame(leaders);
      // socketRef.current.emit('inform-player-new-player-entered-the-room', oponent);
      // socketRef.current.emit();
    } else {
      // disconnect();
      console.log('!againstComputer', againstComputer);
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
    // setMessage(m);
    return m;
  };

  useEffect(() => {
    if (!socketRef.current) {
      console.log('useEffect--->');

      return;
    }
    // socketRef.current.emit('get-leader-board');
    // socketRef.current.on('receive from player', showMess);
    // socketRef.current.on('receive-leader-board', showLeaderBoard);
    return () => {
      // console.log('exit-->');

      // socketRef.current.off('get-leader-board');
      // socketRef.current.off('receive from player');
      socketRef.current.off('receive-leader-board');
    };
  }, [showLeaderBoard]);

  const submitLogin = (e) => {
    e.preventDefault();
    console.log('submit', name, password);
    // setlogin(true);
    FetchApi(url, 'POST', connectGame, { name, password });
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
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
