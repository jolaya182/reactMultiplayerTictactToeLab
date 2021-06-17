// @refresh reset
// eslint-disable-next-line react/prop-types
const Form = ({ setName, submitLogin, setPassword }) => {
  return (
    <div className="form-container">
      <div className="colu">
        <div className="row">
          <input
            type="text"
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
          />
        </div>
        <div className="row">
          <input
            type="password"
            htmlFor="password"
            onKeyPress={(e) => {
              if (e.key === 'Enter') submitLogin(e);
            }}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="password"
          />
        </div>
        <div className="row">
          <button type="button" id="password" onClick={submitLogin}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
export default Form;
