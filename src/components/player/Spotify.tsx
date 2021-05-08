import {useEffect, useState, useCallback} from 'react';
import styled from 'styled-components';
import {LinearProgress, IconButton} from '@material-ui/core';
import {LockRounded} from '@material-ui/icons';
import {usePalette, useSocket, useSnackbar, useIdle, useBool, useTab} from 'hooks';
import {Tune, Controls} from 'components';
import {api} from 'utils';
import {Welcome} from 'models';
import {login} from 'Callback';

const ID = 'Spotify';
const MITIGATE = 100;

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

const Spotify = () => {
  const [isLoading, showLoading, hideLoading] = useBool();
  const [isPlaying, setPlaying] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string>();
  const [authorizeUrl, setAuthorizeUrl] = useState<string>();

  const snack = useSnackbar();
  const [, setPalette] = usePalette();
  const [soca, emit, sub] = useSocket();
  const [, setTab] = useTab();

  const fetchToken = useCallback(async () => {
    console.info('Fetching token...');

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
  }, [authorizeUrl]);

  const connect = useCallback(() => {
    if (soca && soca.disconnected && accessToken && !isLoading) {
      showLoading();
      setTab(1);
      window.setTimeout(() => {
        console.info('Connecting');
        soca.connect();
        emit('initiate');
      }, MITIGATE);
    }
  }, [accessToken, soca, emit, isLoading]);

  const disconnect = useCallback(() => {
    console.info('Disconnecting');
    soca?.disconnect();
    hideLoading();
  }, [soca]);

  useEffect(() => {
    if (soca.connected || !accessToken) return;

    sub(ID, 'initial_state', ({is_playing}: SpotifyApi.CurrentPlaybackResponse) => {
      hideLoading();
      setPlaying(is_playing);
    });
    sub(ID, 'playback_started', () => setPlaying(true));
    sub(ID, 'playback_paused', () => setPlaying(false));
    sub(ID, 'no_token', () => setAccessToken(undefined));

    connect();
  }, [soca, sub, accessToken, connect]);

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
