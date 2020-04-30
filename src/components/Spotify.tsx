import React, {useEffect, useState, useCallback} from 'react';
import styled from 'styled-components';
import {LinearProgress, IconButton} from '@material-ui/core';
import {LockRounded} from '@material-ui/icons';
import {usePalette, useSocket} from 'contexts';
import {useSnackedApi, useIdle} from 'hooks';
import {Artwork, Controls} from 'components';
import {api} from 'utils';
import {ServerError, Track, emptyTrack} from 'models';

const MITIGATE = 100;

const {REACT_APP_SPO_PI_ID: PI = ''} = process.env;

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
  const [accessToken, setAccessToken] = useState<string>('');
  const [authorizeUrl, setAuthorizeUrl] = useState<string>('');
  const [activeTrack, setActiveTrack] = useState<Track>(emptyTrack);

  const snackedApi = useSnackedApi();
  const {setPalette} = usePalette();
  const soca = useSocket();

  const handleLogin = async () => {
    setLoading(true);
    setPalette(['#000', '#000']);
    setupConnect(await login(authorizeUrl));
  };

  const setupConnect = useCallback(
    (accessToken: string) => {
      setAccessToken(accessToken);
      setAuthorizeUrl('');
      const wrappedHandler = (event: any, handler: any) => {
        if (soca)
          soca.on(event, (data: any) => {
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
          setActiveTrack(state.item);
          setPlaying(state.is_playing);
        }
      );
      wrappedHandler('track_change', setActiveTrack);
      wrappedHandler('playback_started', () => setPlaying(true));
      wrappedHandler('playback_paused', () => setPlaying(false));
      wrappedHandler('track_end', () => {});
      wrappedHandler('connect_error', (error: ServerError) => {
        if (error.name === 'NoActiveDeviceError') {
          setLoading(true);
          emit(soca, 'transfer_playback', {id: PI}); //TODO maybe add isPlaying
        } else {
          //TODO not sure
          //api(`${SERVER}/spotify/devices`); what to do?
          console.log('Error', error);
        }
      });
      if (soca) soca.connect();
      emit(soca, 'initiate', {accessToken});
    },
    [soca]
  );

  const connect = useCallback(() => {
    if (soca && soca.disconnected && !isLoading) {
      setLoading(true);
      setTimeout(() => {
        console.info('Socket disconnected, reconnecting now...');
        soca.connect();
        emit(soca, 'initiate', {accessToken});
      }, MITIGATE);
    }
  }, [isLoading, accessToken, soca]);

  const disconnect = useCallback(() => {
    console.info('disconnecting');
    if (soca) soca.disconnect();
  }, [soca]);

  useEffect(() => {
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

  useIdle(connect, disconnect);

  if ('' === authorizeUrl && '' === accessToken) return null;

  return '' === authorizeUrl ? (
    <Container>
      {isLoading && (
        <Loader>
          <LinearProgress />
        </Loader>
      )}
      <Artwork src={activeTrack.album.images[0]?.url} isPlaying={isPlaying} />
      <TrackContainer
        onClick={() => snackedApi(['spotify', 'addok', activeTrack.uri], () => `👌 ${activeTrack.name} added`)}
      >
        {activeTrack.name}
        <Artist>{activeTrack.artists[0].name}</Artist>
      </TrackContainer>
      <Controls isPlaying={isPlaying} setPlaying={setPlaying} />
    </Container>
  ) : (
    <IconButton children={<LockRounded />} onClick={handleLogin} />
  );
};

export {Spotify};
