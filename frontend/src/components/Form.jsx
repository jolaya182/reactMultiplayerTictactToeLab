/* eslint-disable react/prop-types */
// @refresh reset
// eslint-disable-next-line react/prop-types
/**
 * @Author: Javier Olaya
 * @fileName: Form.jsx
 * @date: 6/18/2021
 * @description: this handles the sign up and sign in form
 */
/**
 *
 * @param {func, func, func, func} { setName, submitLogin, setPassword, signUp }
 * @return {html}
 */
const Form = ({ setName, submitLogin, setPassword, signUp }) => {
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
          <button type="button" id="signUp" onClick={signUp}>
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};
export default Form;
