import {useEffect, useState} from 'react';
import {api} from 'utils';

const WINDOW_WIDTH = 450;
const WINDOW_HEIGHT = 840;

const login = (authorizeUrl: string): Promise<string> =>
  new Promise(resolve => {
    const popup = window.open(
      authorizeUrl,
      '_blank',
      `width=${WINDOW_WIDTH},height=${WINDOW_HEIGHT},location=0,resizable=0`
    );
    const listener = window.setInterval(() => {
      if (popup) popup.postMessage('login', window.location.toString());
    }, 500);
    window.onmessage = (event: MessageEvent<string>) => {
      if (popup === event.source) {
        window.clearInterval(listener);
        window.onmessage = null;

        return resolve(event.data);
      }
    };
  });

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
          event.source.postMessage(accessToken);
          window.close();
        }
      });
    }
  }, [accessToken]);

  return <div>Logging in...</div>;
};

export {Callback, login};
