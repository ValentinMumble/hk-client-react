import React, {useEffect, useState, useCallback} from 'react';
import styled from 'styled-components';
import {LinearProgress, IconButton} from '@material-ui/core';
import {LockRounded} from '@material-ui/icons';
import {usePalette, useSocket, useSnackbar} from 'contexts';
import {useIdle} from 'hooks';
import {Tune, Controls} from 'components';
import {api} from 'utils';
import {ServerError, PlayerState} from 'models';

const MITIGATE = 100;

const {REACT_APP_SPO_PI_ID: PI = ''} = process.env;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
`;

const Loader = styled.div`
  width: 100%;
  position: absolute;
  top: 0;
  z-index: 1;
  overflow: hidden;
`;

//TODO
export const emit = (io: any, event: string, value?: number | string | {[key: string]: string | number | boolean}) => {
  console.info('Emit', event, value);
  if (io) io.emit(event, value);
};

const login = (authorizeUrl: string): Promise<string> =>
  new Promise(resolve => {
    const popup = window.open(authorizeUrl, '_blank', 'width=500,height=500,location=0,resizable=0');
    const listener = setInterval(() => {
      if (popup) popup.postMessage('login', window.location.toString());
    }, 500);
    window.onmessage = (event: any) => {
      if (popup === event.source) {
        clearInterval(listener);
        window.onmessage = null;

        return resolve(event.data);
      }
    };
  });

const Spotify = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isPlaying, setPlaying] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string>();
  const [authorizeUrl, setAuthorizeUrl] = useState<string>();

  const snack = useSnackbar();
  const {setPalette} = usePalette();
  const soca = useSocket();

  const fetchToken = useCallback(async () => {
    const {
      status,
      results: [data],
    } = await api<string>(['spotify', 'access-token']);

    if (401 === status) {
      setAuthorizeUrl(data);
      setPalette(['#777', '#777']);
    } else {
      setAccessToken(data);
    }
  }, [setPalette]);

  const handleLogin = async () => {
    if (!authorizeUrl) return;

    setPalette(['#000', '#000']);
    setAccessToken(await login(authorizeUrl));
    setAuthorizeUrl(undefined);
  };

  const connect = useCallback(() => {
    if (soca && soca.disconnected && accessToken) {
      setLoading(true);
      setTimeout(() => {
        console.info('Connecting');
        soca.connect();
        emit(soca, 'initiate', {accessToken});
      }, MITIGATE);
    }
  }, [accessToken, soca]);

  const disconnect = useCallback(() => {
    console.info('Disconnecting');
    if (soca) soca.disconnect();
  }, [soca]);

  const handleError = useCallback(
    async (error: ServerError) => {
      console.log('Connect error', error);
      if (error.name === 'NoActiveDeviceError') {
        setLoading(true);
        emit(soca, 'transfer_playback', {id: PI});
        snack('π', 1000, '#000');
      } else if (error.name === 'The access token expired') {
        disconnect();
        setLoading(true);
        snack('♻️', 1000, 'transparent');
        const {
          results: [accessToken],
        } = await api<string>(['spotify', 'refresh-token']);
        setAccessToken(accessToken);
      }
    },
    [snack, soca, disconnect]
  );

  useEffect(() => {
    if (!soca || soca.connected || !accessToken) return;

    soca.on('initial_state', (state: PlayerState) => {
      setLoading(false);
      setPlaying(state.is_playing);
    });
    soca.on('playback_started', () => setPlaying(true));
    soca.on('playback_paused', () => setPlaying(false));
    soca.on('connect_error', handleError);

    connect();
  }, [soca, accessToken, handleError, connect]);

  useEffect(() => {
    if (!authorizeUrl && !accessToken) fetchToken();
  }, [fetchToken, authorizeUrl, accessToken]);

  useIdle(connect, disconnect);

  if (!authorizeUrl && !accessToken) return null;

  return authorizeUrl ? (
    <IconButton children={<LockRounded />} onClick={handleLogin} />
  ) : (
    <Container>
      {isLoading && (
        <Loader>
          <LinearProgress />
        </Loader>
      )}
      <Tune isPlaying={isPlaying} />
      <Controls isPlaying={isPlaying} setPlaying={setPlaying} />
    </Container>
  );
};

export {Spotify};
