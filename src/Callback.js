import React from 'react';
import {api} from 'utils';

const Callback = () => {
  const parsed = new URLSearchParams(window.location.search);
  api(
    `${process.env.REACT_APP_SERVER_URL}/spotify/authorize/${parsed.get(
      'code'
    )}`
  ).then(data => {
    window.addEventListener('message', event => {
      if (event.data === 'login') {
        event.source.postMessage(
          JSON.stringify(data.accessToken),
          event.origin
        );
        window.close();
      }
    });
    window.setTimeout(window.close, 1500);
  });

  return <div>Logging in...</div>;
};

export {Callback};
