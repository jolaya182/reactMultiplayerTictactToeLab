/* eslint-disable consistent-return */
/* eslint-disable react/react-in-jsx-scope */
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
import History from './History';

/**
 *  main component that holds all component
 * @return {html}
 */
const App = () => {
  const url = 'http://localhost:3000';
  const [oponentIdGa, setOponentIdGa] = useState(false);
  const [history, setHistory] = useState([]);
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

  /**
   * handles incoming top ranked leaders on the leaderboard
   * @param {array} comingLeaders
   */
  const showLeaderBoard = (comingLeaders) => {
    setLeaders(comingLeaders.allLeaders);
    setHistory(comingLeaders.history);
  };

  /**
   * changes the messages on the top part of the application
   * @param {string} action
   * @return {string}
   */
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

  /**
   *  initiate the sockets for the game and receives the data sent by the server
   * @param {array} incomingLeaders
   * @param {obj} incomingPlayer
   */
  const connectGame = (incomingLeaders, incomingPlayer, newhistory) => {
    if (newhistory.length > 0) setHistory(newhistory);
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

  /**
   *  simply closes the socket connection between the server and the browser
   */
  const disconnect = () => {
    socketRef.current.close();
  };

  /**
   * changes the type of player. it changes from playing with the computer
   * and a human
   */
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

  /**
   * builds the game message depending on the log and if it has
   * been paired with another player
   * @return {string}
   */
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

  /**
   * sends login credentials to the server after submiting the form
   * @param {event} e
   */
  const submitLogin = (e) => {
    e.preventDefault();
    FetchApi(`${url}/login`, 'POST', connectGame, { name, password });
  };

  /**
   * Sends credentials to the server to create a player
   * @param {event} e
   */
  const signUp = (e) => {
    e.preventDefault();
    FetchApi(`${url}/create`, 'POST', connectGame, { name, password });
  };

  /**
   * send the server the winner to update the player scores
   */
  const addWinner = () => {
    FetchApi(`${url}/win`, 'POST', (f) => f, {
      winnerId: player,
      loserId: oponentIdGa
    });
  };

  /**
   * reset all player's prop and credentials
   */
  const logout = () => {
    setlogin(false);
    setName(false);
    setOponent(false);
    setMyInfo(false);
    disconnect();
  };

  const setOponentIdGame = (oponentGameId) => {
    setOponentIdGa(oponentGameId);
  };

  return (
    <div>
      <section className="gameHeader">
        Hi!! {myInfo && myInfo.playerName} Tic Tac Toe! {appendMessage()}
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
              <div>
                <History history={history} />
              </div>
            </div>
            <TicTacToeGrid
              socketRef={socketRef}
              oponentId={oponent || againstComputer}
              IAmPlayer={IAmPlayer}
              addWinner={addWinner}
              gamePlayer={player}
              setOponentIdGame={setOponentIdGame}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
