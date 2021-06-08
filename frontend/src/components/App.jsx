/* eslint-disable react/react-in-jsx-scope */
// import React from 'react';
import Hero from './Heros';
import FetchApi from './FetchApi';

const App = () => {
  const url = 'http://localhost:3000';
  FetchApi(url);
  // console.log('data', data);
  return (
    <div>
      <h1>App! </h1>
      <Hero />
    </div>
  );
};
export default App;
