import React, {useEffect, useState, useCallback} from 'react';
import styled from 'styled-components';
import openSocket from 'socket.io-client';
import {LinearProgress, IconButton, ButtonBase} from '@material-ui/core';
import {LockRounded} from '@material-ui/icons';
import {usePalette} from 'contexts';
import {useSnackedApi} from 'hooks';
import {Artwork, Controls} from 'components';
import {api} from 'utils';
import {ServerError, Track, emptyTrack} from 'models';

const {REACT_APP_SERVER_URL: SERVER, REACT_APP_SPO_PI_ID: PI = ''} = process.env;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
`;

const TrackContainer = styled.label`
  display: flex;
  flex-direction: column;
  margin: 4vh 0;
  color: ${({theme}) => theme.palette.primary.main};
  font-size: 0.5em;
  text-align: center;
  max-width: 450px;
`;

const Artist = styled.span`
  justify-content: center;
  opacity: 0.6;
  font-style: italic;
  font-size: 0.8em;
`;

const Loader = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 1;
  overflow: hidden;

  button {
    width: 100%;
    height: 100%;
  }
`;

let io: SocketIOClient.Socket;

//TODO
export const emit = (event: string, value?: number | string | {[key: string]: string | number | boolean}) => {
  console.info('Emit', event, value);
  io.emit(event, value);
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
  const [accessToken, setAccessToken] = useState<string>('');
  const [authorizeUrl, setAuthorizeUrl] = useState<string>('');
  const [activeTrack, setActiveTrack] = useState<Track>(emptyTrack);

  const snackedApi = useSnackedApi();
  const {setPalette} = usePalette();

  const handleLogin = async () => setupConnect(await login(authorizeUrl));

  const setupConnect = useCallback((accessToken: string) => {
    setAccessToken(accessToken);
    const wrappedHandler = (event: any, handler: any) => {
      io.on(event, (data: any) => {
        console.info(event, data);
        handler(data);
      });
    };
    wrappedHandler(
      'initial_state',
      (state: {
        progress_ms: React.SetStateAction<number>;
        item: any;
        device: {volume_percent: React.SetStateAction<number>};
        is_playing: React.SetStateAction<boolean>;
      }) => {
        setLoading(false);
        setAuthorizeUrl('');
        setActiveTrack(state.item);
        setPlaying(state.is_playing);
      }
    );
    wrappedHandler('track_change', setActiveTrack);
    wrappedHandler('playback_started', () => setPlaying(true));
    wrappedHandler('playback_paused', () => setPlaying(false));
    wrappedHandler('track_end', () => {});
    wrappedHandler('connect_error', (error: ServerError) => {
      console.log('Errrrror', error);
      if (error.name === 'NoActiveDeviceError') {
        setLoading(true);
        emit('transfer_playback', {id: PI}); //TODO maybe add isPlaying
      } else if (error.name === 'Device not found') {
        //TODO not sure
        //api(`${SERVER}/spotify/devices`); what to do?
      }
    });
    emit('initiate', {accessToken});
  }, []);

  const connect = useCallback(() => {
    if (io && io.disconnected && !isLoading) {
      setLoading(true);
      console.info('Socket disconnected, reconnecting now...');
      io.open();
      emit('initiate', {accessToken});
    }
  }, [isLoading, accessToken]);

  const disconnect = useCallback(() => {
    console.info('disconnecting');
    io.close();
  }, []);

  useEffect(() => {
    io = openSocket(`${SERVER}/connect`, {reconnection: false});
    (async () => {
      const {
        status,
        results: [data],
      } = await api<string>(['spotify', 'access-token']);

      if (401 === status) {
        setAuthorizeUrl(data);
        setPalette(['#777', '#777']);
      } else {
        setupConnect(data);
      }
    })();
  }, [setPalette, setupConnect]);

  useEffect(() => {
    // inactivityTime(connect, disconnect);

    const handleVisibility = () => (document.hidden ? disconnect() : connect());

    document.addEventListener('visibilitychange', handleVisibility);

    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [connect, disconnect]);

  if ('' === authorizeUrl && '' === accessToken) return null;

  return '' === authorizeUrl ? (
    <Container>
      {isLoading && (
        <Loader>
          <LinearProgress />
          <ButtonBase />
        </Loader>
      )}
      <Artwork io={io} src={activeTrack.album.images[0]?.url} isPlaying={isPlaying} />
      <TrackContainer
        onClick={() => snackedApi(['spotify', 'addok', activeTrack.uri], () => `👌 ${activeTrack.name} added`)}
      >
        {activeTrack.name}
        <Artist>{activeTrack.artists[0].name}</Artist>
      </TrackContainer>
      <Controls io={io} isPlaying={isPlaying} setPlaying={setPlaying} />
    </Container>
  ) : (
    <IconButton children={<LockRounded />} onClick={handleLogin} />
  );
};

export {Spotify};
