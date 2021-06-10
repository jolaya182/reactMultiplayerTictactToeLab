/* eslint-disable react/prop-types */
import Row from './Row';
import TextBox from './TextBox';

const Chat = ({
  allUsers,
  currentChat,
  connectedToRooms,
  message,
  messages,
  handleMessageChange,
  toggleChat,
  yourId,
  joinRoom,
  handleKeyPress
}) => {
  const rooms = ['general', 'random', 'jokers', 'javascript'];

  const renderRooms = (room) => {
    const newCurrentChat = {
      chatName: room,
      isChannel: true,
      received: ''
    };

    return (
      <Row
        className="row"
        onClick={() => toggleChat(newCurrentChat)}
        key={room}
      >
        {room}
      </Row>
    );
  };

  const renderUser = (user) => {
    if (user.id === yourId) {
      return (
        <div className="row" key={user.id}>
          {' '}
          You: {user.username}
        </div>
      );
    }
    const newCurrentChat = {
      chatName: user.username,
      isChannel: false,
      receivedId: user.id
    };
    return (
      <Row className="row" onClick={() => toggleChat(newCurrentChat)}>
        {user.username}
      </Row>
    );
  };

  const renderMessages = (incomingMessage, index) => {
    const { sender, content } = incomingMessage;
    return (
      <div key={index}>
        <h3>{sender}</h3>
        <p>{content}</p>
      </div>
    );
  };

  let body;
  const { isChannel, chatName } = currentChat;
  if (isChannel || connectedToRooms.includes(chatName)) {
    body = <div className="messages">{messages.map(renderMessages)}</div>;
  } else {
    body = (
      <button onClick={() => joinRoom(chatName)} type="button">
        Join {currentChat.chatName}
      </button>
    );
  }

  return (
    <div className="container">
      <div className="sidebar">
        {rooms.map(renderRooms)}
        <h1> All Users</h1>
        {allUsers.map(renderUser)}
      </div>
      <div className="chat-panel">
        <div className="chat-info">{currentChat.chatName}</div>
        <div className="body-container">{body}</div>
        <TextBox
          value={message}
          handleMessageChange={handleMessageChange}
          handleKeyPress={handleKeyPress}
          placeholder="say something"
          Disconnect={Disconnect}
        />
      </div>
    </div>
  );
};
export default Chat;
