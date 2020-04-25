import React, {useEffect, useState, useCallback} from 'react';
import styled from 'styled-components';
import openSocket from 'socket.io-client';
import {Slider, LinearProgress, IconButton, ButtonBase} from '@material-ui/core';
import {
  FavoriteRounded,
  NewReleasesRounded,
  SkipPreviousRounded,
  PlayArrowRounded,
  PauseRounded,
  SkipNextRounded,
  LockRounded,
} from '@material-ui/icons';
import {useSnackbar, usePalette} from 'contexts';
import {useSnackedApi} from 'hooks';
import {Artwork, Span} from 'components';
import {api} from 'utils';

const {
  REACT_APP_SERVER_URL,
  REACT_APP_SPO_DISCOVER_WEEKLY_URI,
  REACT_APP_SPO_LIKES_URI,
  REACT_APP_SPO_PI_ID,
} = process.env;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: inherit;
`;

const Track = styled.div`
  display: flex;
  flex-direction: column;
  margin: 5vh 0;
  color: ${({theme}) => theme.palette.primary.main};
  font-size: 0.5em;
  text-align: center;
`;

const Artist = styled.span`
  justify-content: center;
  opacity: 0.6;
  font-style: italic;
  font-size: 0.8em;
`;

const VolumeDiv = styled.div`
  width: 85%;
  height: 75px;
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

type Image = {
  url: string;
};

type Artist = {
  name: string;
};

type Album = {
  images: Image[];
};

//TODO
type Track = {
  uri: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
};

let io: SocketIOClient.Socket;

const emit = (event: string, value?: number | string | {[key: string]: string}) => {
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
  //TODO useless?
  const [error, setError] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isPlaying, setPlaying] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [authorizeUrl, setAuthorizeUrl] = useState<string>('');
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [volume, setVolume] = useState<number>(0);
  const [trackProgress, setTrackProgress] = useState<number>(0);

  const snack = useSnackbar();
  const snackedApi = useSnackedApi();
  const {setPalette} = usePalette();

  const handleLogin = async () => setupConnect(await login(authorizeUrl));

  const handleError = useCallback(error => {
    console.error('Errrrror', error);
    if (error.name === 'NoActiveDeviceError') {
      setLoading(true);
      emit('transfer_playback', {id: `${REACT_APP_SPO_PI_ID}`});
    } else if (error === 'Device not found') {
      //api(`${SERVER}/spotify/devices`); what to do?
    } else {
      setError(error.message || error);
    }
  }, []);

  const setupConnect = useCallback(
    (accessToken: string) => {
      setAccessToken(accessToken);
      io = openSocket(`${REACT_APP_SERVER_URL}/connect`, {reconnection: false});
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
          setTrackProgress(state.progress_ms);
          setActiveTrack(state.item);
          setVolume(state.device.volume_percent);
          setPlaying(state.is_playing);
        }
      );
      wrappedHandler('track_change', setActiveTrack);
      wrappedHandler('seek', setTrackProgress);
      wrappedHandler('playback_started', () => setPlaying(true));
      wrappedHandler('playback_paused', () => setPlaying(false));
      wrappedHandler('volume_change', setVolume);
      wrappedHandler('track_end', () => {});
      wrappedHandler('connect_error', handleError);
      emit('initiate', {accessToken});
    },
    [handleError]
  );

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
    if ('' === accessToken && '' === authorizeUrl) {
      (async () => {
        const {
          status,
          results: [data],
        } = await api<string>(['spotify', 'access-token']);

        if (401 === status) {
          setAuthorizeUrl(data);
          setPalette(['#777']);
        } else {
          setupConnect(data);
        }
      })();
    }
  }, [setupConnect, accessToken, authorizeUrl, setPalette]);

  useEffect(() => {
    // inactivityTime(connect, disconnect);

    const handleVisibility = () => (document.hidden ? disconnect() : connect());

    document.addEventListener('visibilitychange', handleVisibility);

    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [connect, disconnect]);

  return authorizeUrl === '' ? (
    null !== activeTrack ? (
      <Container>
        {isLoading && (
          <Loader>
            <LinearProgress color="secondary" />
            <ButtonBase />
          </Loader>
        )}
        <Artwork
          src={0 < activeTrack.album.images.length ? activeTrack.album.images[0].url : ''}
          isPlaying={isPlaying}
          trackDuration={activeTrack.duration_ms}
          initProgress={trackProgress}
        />
        <Track onClick={() => snackedApi(['spotify', 'addok', activeTrack.uri], () => `👌 ${activeTrack.name} added`)}>
          {activeTrack.name}
          <Artist>{activeTrack.artists[0].name}</Artist>
        </Track>
        <Controls>
          <IconButton
            children={<NewReleasesRounded />}
            onClick={() => {
              emit('play', {
                context_uri: `${REACT_APP_SPO_DISCOVER_WEEKLY_URI}`,
              });
              snack('✨ Playing Discover Weekly');
            }}
          />
          <IconButton children={<SkipPreviousRounded />} onClick={() => emit('previous_track')} />
          <Span size="large">
            <IconButton
              onClick={() => {
                emit(isPlaying ? 'pause' : 'play');
                setPlaying(!isPlaying);
              }}
            >
              {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
            </IconButton>
          </Span>
          <IconButton children={<SkipNextRounded />} onClick={() => emit('next_track')} />
          <IconButton
            children={<FavoriteRounded />}
            onClick={() => {
              emit('play', {
                context_uri: `${REACT_APP_SPO_LIKES_URI}`,
              });
              snack('❤️ Playing liked songs');
            }}
          />
        </Controls>
        <VolumeDiv>
          <Slider
            valueLabelDisplay="auto"
            value={volume}
            onChange={(_e, v) => setVolume(Number(v))}
            onChangeCommitted={(_e, v) => emit('set_volume', Number(v))}
          />
        </VolumeDiv>
      </Container>
    ) : (
      <>{error}</>
    )
  ) : (
    <Controls>
      <IconButton children={<LockRounded />} onClick={handleLogin} />
    </Controls>
  );
};

export {Spotify};
