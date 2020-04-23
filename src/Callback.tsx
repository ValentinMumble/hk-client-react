import React, {useEffect, useState} from 'react';
import {api} from 'utils';

const Callback = () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const [accessToken, setAccessToken] = useState<string>('');

  const fetchAccessToken = async (code: string) => {
    const {
      results: [accessToken],
    } = await api<string>(['spotify', 'authorize', code]);
    setAccessToken(accessToken);
  };

  useEffect(() => {
    if (null !== code) fetchAccessToken(code);
  }, [code]);

  useEffect(() => {
    if ('' !== accessToken) {
      window.addEventListener('message', event => {
        if (
          event.data === 'login' &&
          event.source !== null &&
          !(event.source instanceof MessagePort) &&
          !(event.source instanceof ServiceWorker)
        ) {
          event.source.postMessage(accessToken, event.origin);
          window.close();
        }
      });
    }
  }, [accessToken]);

  return <div>Logging in...</div>;
};

export {Callback};
