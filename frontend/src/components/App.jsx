/* eslint-disable react/react-in-jsx-scope */
// @refresh reset
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import immer from 'immer';
// import Hero from './Heros';
// import FetchApi from './FetchApi';
import Form from './Form';
import Chat from './Chat';

const App = () => {
  // const url = 'http://localhost:3000';

  const initialMessageState = {
    general: [],
    random: [],
    jokes: [],
    javascript: []
  };
  // FetchApi(url);
  const [username, setUsername] = useState('javier');
  const [connected, setConnected] = useState(false);
  const [currentChat, setCurrentChat] = useState({
    isChannel: true,
    chatName: 'general',
    received: ''
  });
  const [connectedRooms, setConnectedRooms] = useState(['general']);
  const [allUsers, setAllUsers] = useState([]);
  const [messages, setMessages] = useState(initialMessageState);
  const [message, setMessage] = useState();
  const [oponent, setOponent] = useState();
  const [player, setPlayer] = useState();
  const socketRef = useRef();

  const sendMessage = () => {
    console.log('sendMessage');
    const payload = {
      content: message,
      to: currentChat.isChannel ? currentChat.chatName : currentChat.receiverId,
      sender: username,
      chatName: currentChat.chatName,
      isChannel: currentChat.isChannel
    };
    socketRef.current.emit('send message', payload);
    const newMessages = immer(messages, (draft) => {
      draft[currentChat.chatName].push({
        sender: username,
        content: message
      });
    });
    setMessage(newMessages);
  };

  const handleKeyPress = () => {
    // console.log('sent');
    // if (e.key === 'Enter') {
    sendMessage();
    // }
  };

  const handleMessageChange = (e) => {
    const { value } = e.target;
    console.log('handleMessageChange', value);
    setMessage(value);
    // handleKeyPress(value);
  };
  const handleChange = (e) => {
    console.log('handleChange');
    setUsername(e.target.value);
  };

  const roomJoinCallback = (incomingMessages, room) => {
    console.log('roomJoinCallback');
    const newMessages = immer(messages, (draft) => {
      draft[room] = incomingMessages;
    });
    setMessages(newMessages);
  };

  const joinRoom = (room) => {
    console.log('joinRoom');

    const newConnectedRooms = immer(connectedRooms, (draft) => {
      draft.push(room);
    });
    socketRef.current.emit('join room', room, (incomingMessages) =>
      roomJoinCallback(incomingMessages, room)
    );
    setConnectedRooms(newConnectedRooms);
  };

  const toggleChat = (newCurrentChat) => {
    if (!messages[newCurrentChat.chatName]) {
      const newMessages = immer(messages, (draft) => {
        draft[newCurrentChat.chatName] = [];
      });
      setMessages(newMessages);
    }
    setCurrentChat(newCurrentChat);
  };

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
      setOponent(oponentPlayer);
      console.log('player is ', gameInfo[iAm]);
      setPlayer(gameInfo[iAm]);
    });
  };

  const Disconnect = () => {
    socketRef.current.emit('delete-room');
  };

  const comm = () => {
    // const { id } = oponent;
    socketRef.current.emit('send to player', oponent);
    socketRef.current.on('receive from player', (mess) => {
      console.log('mess to ->', mess);
    });
  };

  const connect = (e) => {
    e.preventDefault();
    setConnected(true);
    socketRef.current = io.connect('http://localhost:3000', {
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttemps: 10,
      transports: ['websocket'],
      agent: false,
      upgrade: false,
      rejectUnauthorized: false
    });

    socketRef.current.emit('join server', username);
    socketRef.current.emit('join room', 'general', (newMessages) =>
      roomJoinCallback(newMessages, 'general')
    );
    socketRef.current.on('new user', (newAllUsers) => {
      setAllUsers(newAllUsers);
    });

    socketRef.current.on('new message', ({ content, sender, chatName }) => {
      console.log('new message-->');
      setMessages((theNewMessages) => {
        const newMessages = immer(theNewMessages, (draft) => {
          if (draft[chatName]) {
            draft[chatName].push({ content, sender });
          } else {
            draft[chatName] = [{ content, sender }];
          }
        });
        return newMessages;
      });
    });
  };

  useEffect(() => {
    setMessage('');
  }, [messages]);
  let body;
  if (connected) {
    console.log('currentChat', messages[currentChat.chatName]);
    body = (
      <Chat
        message={message}
        handleMessageChange={handleMessageChange}
        yourId={socketRef.current ? socketRef.current.id : ''}
        allUsers={allUsers}
        joinRoom={joinRoom}
        connectedRooms={connectedRooms}
        currentChat={currentChat}
        toggleChat={toggleChat}
        messages={messages[currentChat.chatName]}
        handleKeyPress={handleKeyPress}
      />
    );
  } else {
    body = (
      <Form
        username={username}
        onChange={handleChange}
        connect={connectGame}
        Disconnect={Disconnect}
        comm={comm}
      />
    );
  }

  return (
    <div>
      {/* <Hero /> */}
      {body}
    </div>
  );
};
export default App;
