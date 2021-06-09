// @refresh reset
// eslint-disable-next-line react/prop-types
const Form = ({ username, onChange, connect }) => {
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
    </form>
  );
};
export default Form;
