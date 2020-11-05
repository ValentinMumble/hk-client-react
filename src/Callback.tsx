import React, {useEffect, useState} from 'react';
import {api} from 'utils';

const Callback = () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const [accessToken, setAccessToken] = useState<string>('');

  const fetchAccessToken = async (code: string) => {
    const {
      data: {accessToken},
    } = await api<{accessToken: string}>(['spotify', 'authorize', code]);
    setAccessToken(accessToken);
  };

  useEffect(() => {
    if (null !== code) fetchAccessToken(code);
  }, [code]);

  useEffect(() => {
    if ('' !== accessToken) {
      window.addEventListener('message', event => {
        if ('login' === event.data && null !== event.source && !(event.source instanceof MessagePort)) {
          event.source.postMessage(accessToken, event.origin);
          window.close();
        }
      });
    }
  }, [accessToken]);

  return <div>Logging in...</div>;
};

export {Callback};
