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

const ContainerDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
`;

const ControlsDiv = styled.div`
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

const ArtistSpan = styled.span`
  justify-content: center;
  opacity: 0.6;
  font-style: italic;
  font-size: 0.8em;
`;

const VolumeDiv = styled.div`
  width: 85%;
  height: 75px;
`;

const LoaderDiv = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 1;
  opacity: 0.6;
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

const Spotify = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [authorizeUrl, setAuthorizeUrl] = useState('');
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [volume, setVolume] = useState(0);
  const [trackProgress, setTrackProgress] = useState(0);

  const snack = useSnackbar();
  const snackedApi = useSnackedApi();
  const {setPalette} = usePalette();

  const emit = (event: string, value?: number | string | {[key: string]: string}) => {
    console.info('Emit', event, value);
    io.emit(event, value);
    switch (event) {
      case 'play':
        setPlaying(true);
        break;
      case 'pause':
        setPlaying(false);
        break;
      default:
        break;
    }
  };

  const onError = useCallback(error => {
    console.error(error);
    if (error.name === 'NoActiveDeviceError') {
      setLoading(true);
      emit('transfer_playback', {id: `${REACT_APP_SPO_PI_ID}`});
    } else if (error === 'Device not found') {
      //api(`${SERVER}/spotify/devices`).then(onApi);
    } else {
      setError(error.message || error);
    }
  }, []);

  const login = () => {
    return new Promise(resolve => {
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
  };

  const setupConnect = useCallback(
    accessToken => {
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
      wrappedHandler('connect_error', onError);
      emit('initiate', {accessToken});
    },
    [onError]
  );

  // const connect = useCallback(() => {
  //   if (io && io.disconnected && !loading) {
  //     setLoading(true);
  //     console.info('Socket disconnected, reconnecting now...');
  //     io.open();
  //     emit('initiate', {accessToken});
  //   }
  // }, [loading, accessToken]);

  // const disconnect = useCallback(() => {
  //   console.info('Timeout: disconnecting');
  //   io.close();
  // }, []);

  useEffect(() => {
    if ('' === accessToken && authorizeUrl === '') {
      api<{url: string} | {accessToken: string}>(['spotify', 'access-token']).then(({results: [data]}) => {
        if ('url' in data) {
          setAuthorizeUrl(data.url);
          setPalette(['#777', '#777']);
        } else {
          setupConnect(data.accessToken);
        }
      });
    }
    // inactivityTime(connect, disconnect);

    // document.addEventListener('visibilitychange', () => {
    //   if (document.hidden) {
    //     disconnect();
    //   } else {
    //     connect();
    //   }
    // });

    // return () => document.removeEventListener('visibilitychange');
  }, [
    // connect,
    // disconnect,
    setupConnect,
    accessToken,
    authorizeUrl,
    setPalette,
  ]);

  return authorizeUrl === '' ? (
    null !== activeTrack ? (
      <ContainerDiv>
        {loading && (
          <LoaderDiv>
            <LinearProgress color="secondary" />
            <ButtonBase />
          </LoaderDiv>
        )}
        <Artwork
          src={activeTrack.album.images.length > 0 ? activeTrack.album.images[0].url : ''}
          isPlaying={playing}
          trackDuration={activeTrack.duration_ms}
          initProgress={trackProgress}
        />
        <Track onClick={() => snackedApi(['spotify', 'addok', activeTrack.uri], () => `👌 ${activeTrack.name} added`)}>
          {activeTrack.name}
          <ArtistSpan>{activeTrack.artists[0].name}</ArtistSpan>
        </Track>
        <ControlsDiv>
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
            <IconButton onClick={() => emit(playing ? 'pause' : 'play')}>
              {playing ? <PauseRounded /> : <PlayArrowRounded />}
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
        </ControlsDiv>
        <VolumeDiv>
          <Slider
            valueLabelDisplay="auto"
            value={volume}
            onChange={(_e, v) => setVolume(Number(v))}
            onChangeCommitted={(_e, v) => emit('set_volume', Number(v))}
          />
        </VolumeDiv>
      </ContainerDiv>
    ) : (
      <>{error}</>
    )
  ) : (
    <ControlsDiv>
      <IconButton children={<LockRounded />} onClick={() => login().then(setupConnect)} />
    </ControlsDiv>
  );
};

export {Spotify};
