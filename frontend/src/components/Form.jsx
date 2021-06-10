// @refresh reset
// eslint-disable-next-line react/prop-types
const Form = ({ username, onChange, connect, Disconnect, comm }) => {
  return (
    <form>
      <input
        placeholder="Username..."
        type="text"
        value={username}
        onChange={onChange}
      />
      <button onClick={connect} type="button">
        Connect
      </button>
      <button type="button" onClick={() => Disconnect()}>
        Disconnect
      </button>
      <button type="button" onClick={comm}>
        comm
      </button>
    </form>
  );
};
export default Form;
