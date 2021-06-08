// import { useState } from 'react';
// import React from 'react';

const FetchApi = (url) => {
  const data = {
    method: 'GET',
    // body: JSON.stringify({ DATA: 'BEST' }),
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  };

  // const response = JSON.parse((await fetch(url, data)).json);

  fetch(url, data)
    .then((r) => {
      const rr = r.json();
      return rr;
    })
    .then((j) => {
      console.log('FOUND', j);
      return j;
    })
    .catch((err) => console.log('error->', err));
  // const result = JSON.parse(response);
  // console.log('response', response);
  // return response;
};

export default FetchApi;
