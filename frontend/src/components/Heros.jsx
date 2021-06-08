// @refresh reset
import { useState } from 'react';

const Heros = () => {
  const marvel = {
    wolverine: 'logan',
    cyclops: 'scott',
    spiderMan: 'peter Parker'
  };

  const superHeros = {
    batman: 'bruce',
    wonderwoman: 'diana',
    superman: 'kent',
    ...marvel
  };

  const [sheros, setSheros] = useState({});

  return (
    <div>
      Hero!!!
      <button type="button" onClick={() => setSheros(marvel)}>
        Marvel
      </button>
      <button type="button" onClick={() => setSheros(superHeros)}>
        ALL
      </button>
      <ul>
        {Object.keys(sheros).map((h, index) => (
          <li key={`hero-${index}`}> {`${h}: ${sheros[h]}`}</li>
        ))}
      </ul>
    </div>
  );
};
export default Heros;
