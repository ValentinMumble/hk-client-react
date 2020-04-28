import React, {useEffect, useState, useCallback, MouseEvent, Dispatch, SetStateAction} from 'react';
import styled from 'styled-components';
import openSocket from 'socket.io-client';
import {Slider, LinearProgress, IconButton, ButtonBase, Menu, MenuItem} from '@material-ui/core';
import {
  SkipPreviousRounded,
  PlayArrowRounded,
  PauseRounded,
  SkipNextRounded,
  LockRounded,
  QueueMusicRounded,
  SpeakerRounded,
} from '@material-ui/icons';
import {useSnackbar, usePalette} from 'contexts';
import {useSnackedApi} from 'hooks';
import {Artwork, Span, Emoji} from 'components';
import {api} from 'utils';

const {
  REACT_APP_SERVER_URL: SERVER,
  REACT_APP_SPO_DISCOVER_WEEKLY_URI: DISCO = '',
  REACT_APP_SPO_LIKES_URI: LIKES = '',
  REACT_APP_SPO_OK_URI: OK = '',
  REACT_APP_SPO_PI_ID: PI = '',
} = process.env;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
`;

const ControlsContainer = styled.div`
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
  max-width: 450px;
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

type ControlsProps = {
  isPlaying: boolean;
  setPlaying: Dispatch<SetStateAction<boolean>>;
};

const Controls = ({isPlaying, setPlaying}: ControlsProps) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement>();

  const snack = useSnackbar();

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => setMenuAnchor(event.currentTarget);
  const closeMenu = () => setMenuAnchor(undefined);

  const setPlaylist = (uri: string, message: string) => {
    emit('play', {context_uri: uri});
    const words = message.split('\n');
    words.splice(1, 0, 'Playing');
    snack(words.join(' '));
    closeMenu();
  };

  return (
    <ControlsContainer>
      <IconButton children={<SpeakerRounded />} onClick={() => emit('transfer_playback', {id: PI})} />
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
      <IconButton children={<QueueMusicRounded />} onClick={openMenu} />
      <Menu anchorEl={menuAnchor} keepMounted open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={event => setPlaylist(DISCO, event.currentTarget.innerText)}>
          <Emoji e="✨" /> Discover
        </MenuItem>
        <MenuItem onClick={event => setPlaylist(LIKES, event.currentTarget.innerText)}>
          <Emoji e="❤️" /> Likes
        </MenuItem>
        <MenuItem onClick={event => setPlaylist(OK, event.currentTarget.innerText)}>
          <Emoji e="👌" /> OK
        </MenuItem>
      </Menu>
    </ControlsContainer>
  );
};

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

  const snackedApi = useSnackedApi();
  const {setPalette} = usePalette();

  const handleLogin = async () => setupConnect(await login(authorizeUrl));

  const handleError = useCallback(error => {
    console.error('Errrrror', error);
    if (error.name === 'NoActiveDeviceError') {
      setLoading(true);
      emit('transfer_playback', {id: PI});
    } else if (error === 'Device not found') {
      //api(`${SERVER}/spotify/devices`); what to do?
    } else {
      setError(error.message || error);
    }
  }, []);

  const setupConnect = useCallback(
    (accessToken: string) => {
      setAccessToken(accessToken);
      io = openSocket(`${SERVER}/connect`, {reconnection: false});
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
            <LinearProgress />
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
        <Controls isPlaying={isPlaying} setPlaying={setPlaying} />
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
    <ControlsContainer>
      <IconButton children={<LockRounded />} onClick={handleLogin} />
    </ControlsContainer>
  );
};

export {Spotify};
