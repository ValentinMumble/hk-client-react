import React, {useEffect, useState, useCallback} from 'react';
import styled from 'styled-components';
import {LinearProgress, IconButton} from '@material-ui/core';
import {LockRounded} from '@material-ui/icons';
import {usePalette, useSocket, useSnackbar, useIdle} from 'hooks';
import {Tune, Controls} from 'components';
import {api} from 'utils';
import {ServerError, PlayerState, Welcome} from 'models';

const ID = 'Spotify';
const MITIGATE = 100;
const {REACT_APP_SPO_PI_ID: PI = ''} = process.env;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
`;

const Loader = styled.div<{isLoading: boolean}>`
  width: 100%;
  position: absolute;
  top: 0;
  z-index: 1;
  overflow: hidden;
  opacity: ${({isLoading}) => (isLoading ? 1 : 0)};
  transition: opacity 400ms ease;
`;

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
  const [, setPalette] = usePalette();
  const [soca, emit, sub] = useSocket();

  const fetchToken = useCallback(async () => {
    try {
      const {
        status,
        data: {accessToken, authorizeUrl, palette},
      } = await api<Welcome>(['spotify', 'access-token']);

      if (401 === status) {
        setAuthorizeUrl(authorizeUrl);
        setPalette(['#777']);
      } else {
        setAccessToken(accessToken);
        setPalette(palette ?? ['#777']);
      }
    } catch (error) {
      setPalette(['#777']);
      snack('😖 Server seems down...');
    }
  }, [setPalette]);

  const handleLogin = useCallback(async () => {
    if (!authorizeUrl) return;

    setAccessToken(await login(authorizeUrl));
    setAuthorizeUrl(undefined);
  }, [authorizeUrl, setPalette]);

  const connect = useCallback(() => {
    if (soca && soca.disconnected && accessToken) {
      setLoading(true);
      setTimeout(() => {
        console.info('Connecting');
        soca.connect();
        emit('initiate', {accessToken});
      }, MITIGATE);
    }
  }, [accessToken, soca, emit]);

  const disconnect = useCallback(() => {
    console.info('Disconnecting');
    if (soca) soca.disconnect();
  }, [soca]);

  const handleError = useCallback(
    async (error: ServerError) => {
      console.log('Connect error', error);
      if (error.name === 'NoActiveDeviceError') {
        setLoading(true);
        emit('transfer_playback', {id: PI});
        snack('π', 1000, 'transparent');
      } else if (error.name === 'The access token expired') {
        disconnect();
        setLoading(true);
        snack('♻️', 1000, 'transparent');
        const {
          data: {accessToken},
        } = await api<Welcome>(['spotify', 'refresh-token']);
        setAccessToken(accessToken);
      }
    },
    [snack, disconnect, emit]
  );

  useEffect(() => {
    if (soca.connected || !accessToken) return;

    sub(ID, 'initial_state', (state: PlayerState) => {
      setLoading(false);
      setPlaying(state.is_playing);
    });
    sub(ID, 'playback_started', () => setPlaying(true));
    sub(ID, 'playback_paused', () => setPlaying(false));
    sub(ID, 'connect_error', handleError);

    connect();
  }, [soca, sub, accessToken, handleError, connect]);

  useEffect(() => {
    if (!authorizeUrl && !accessToken) fetchToken();
  }, [fetchToken, authorizeUrl, accessToken]);

  useIdle(connect, disconnect);

  if (!authorizeUrl && !accessToken) return null;

  return authorizeUrl ? (
    <IconButton children={<LockRounded />} onClick={handleLogin} />
  ) : (
    <Container>
      <Loader isLoading={isLoading}>
        <LinearProgress />
      </Loader>
      <Tune isPlaying={isPlaying} />
      <Controls isPlaying={isPlaying} setPlaying={setPlaying} />
    </Container>
  );
};

export {Spotify};
