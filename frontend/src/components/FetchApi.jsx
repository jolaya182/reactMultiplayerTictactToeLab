// import { useState } from 'react';
// import React from 'react';

const FetchApi = (url, method, callBack, payload) => {
  const data = {
    method,
    // body: JSON.stringify({ DATA: 'BEST' }),
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
      const leaders = incomingData.data;
      if (Object.keys(leaders.length)) {
        callBack(leaders);
      } else {
        console.log('false');
        alert('Please insert a valid name or password');
      }

    })
    .catch((err) => console.log('error->', err));
  // const result = JSON.parse(response);
  // console.log('response', response);
  // return response;
};

export default FetchApi;
