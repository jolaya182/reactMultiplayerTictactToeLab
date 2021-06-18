/**
 * @Author: Javier Olaya
 * @fileName: FetchApi.jsx
 * @date: 6/18/2021
 * @description: Hook component that handles post and get requests
 */

/**
 *
 * @param {string} url
 * @param {func} method
 * @param {func} callBack
 * @param {obj} payload
 */
const FetchApi = (url, method, callBack, payload) => {
  const data = {
    method,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  };
  if (method === 'POST') data.body = JSON.stringify(payload);

  fetch(url, data)
    .then((r) => {
      const rr = r.json();
      return rr;
    })
    .then((incomingData) => {
      console.log('incomingData', incomingData);
      const { allLeaders, player } = incomingData.data;
      if (Object.keys(player.length)) {
        const history = incomingData.data.history
          ? incomingData.data.history
          : [];
        callBack(allLeaders, player[0], history);
      } else {
        alert('Please insert a valid name or password');
      }
    })
    .catch((err) => console.log('error->', err));
};

export default FetchApi;
