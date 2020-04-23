import React, {useEffect, useState, useCallback} from 'react';
import styled from 'styled-components';
import SwipeableViews from 'react-swipeable-views';
import openSocket from 'socket.io-client';
import {Slider, LinearProgress, IconButton, Typography, ButtonBase, Tabs, Tab} from '@material-ui/core';
import {
  RadioRounded,
  FavoriteRounded,
  MusicNoteRounded,
  VolumeDownRounded,
  VolumeUpRounded,
  NewReleasesRounded,
  SkipPreviousRounded,
  PlayArrowRounded,
  PauseRounded,
  SkipNextRounded,
  LockRounded,
  WbIncandescentRounded,
  Warning,
  BluetoothDisabledRounded,
  PowerOffRounded,
  BluetoothSearchingRounded,
  TimerRounded,
} from '@material-ui/icons';
import {Artwork, Hues} from 'components';
import {useSnackbar} from 'Snackbar';
import {useTheme} from 'theme';
import {api} from 'utils';

const {
  REACT_APP_SERVER_URL,
  REACT_APP_SPO_DISCOVER_WEEKLY_URI,
  REACT_APP_SPO_LIKES_URI,
  REACT_APP_SPO_PI_ID,
} = process.env;

const Container = styled.div`
  font-size: 7vh;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100vw;
  height: 100vh;
`;

const Span = styled.span`
  display: flex;
  font-size: ${props => {
    if (Number.isInteger(props.size)) return props.size + 'vh';
    switch (props.size) {
      case 'large':
        return '10vh';
      default:
        return 'inherit';
    }
  }};
  > .MuiSvgIcon-root {
    margin-right: 10px;
  }
`;

const ArtistSpan = styled(Span)`
  justify-content: center;
  opacity: 0.6;
  font-style: italic;
  font-size: 0.8em;
`;

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
  font-size: 5vh;
`;

const ControlsGrowDiv = styled(ControlsDiv)`
  flex-grow: 1;
`;

const VolumeDiv = styled.div`
  width: 85%;
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
let io = null;

export const HK = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [authorizeUrl, setAuthorizeUrl] = useState('');
  const [activeTrack, setActiveTrack] = useState(null);
  const [volume, setVolume] = useState(0);
  const [trackProgress, setTrackProgress] = useState(0);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [palette, setPalette] = useState([]);

  const {snack} = useSnackbar();
  const {buildTheme} = useTheme();

  const emit = (event, value) => {
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

  const onApi = useCallback(
    json => {
      snack(
        json.error ? (
          <Span>
            <Warning fontSize="small" /> {json.error.message || json.error}
          </Span>
        ) : (
          json.message
        )
      );
    },
    [snack]
  );

  const onError = useCallback(error => {
    console.error(error);
    if (error.name === 'NoActiveDeviceError') {
      setLoading(true);
      emit('transfer_playback', {id: REACT_APP_SPO_PI_ID});
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
        if (popup) popup.postMessage('login', window.location);
      }, 500);
      window.onmessage = event => {
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
      const wrappedHandler = (event, handler) => {
        io.on(event, data => {
          console.info(event, data);
          handler(data);
        });
      };
      wrappedHandler('initial_state', state => {
        setLoading(false);
        setAuthorizeUrl('');
        setTrackProgress(state.progress_ms);
        setActiveTrack(state.item);
        setVolume(state.device.volume_percent);
        setPlaying(state.is_playing);
      });
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

  const onHueClick = color => {
    if (color) {
      api(['hue', 'on', color.substring(1)]).then(onApi);
      snack('Turning lights on...', 1000, color);
    } else {
      api(['hue', 'off']).then(onApi);
      snack('Turning lights off...', 1000, '#000');
    }
  };

  const onColorChange = useCallback(setPalette, []);

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
      api(['spotify', 'access-token']).then(({results: [data]}) => {
        if (data.url) {
          setAuthorizeUrl(data.url);
          buildTheme('#777');
        } else {
          setupConnect(data.accessToken);
        }
      });
    }

    // document.addEventListener('visibilitychange', () => {
    //   if (document.hidden) {
    //     disconnect();
    //   } else {
    //     connect();
    //   }
    // });

    // inactivityTime(connect, disconnect);

    // return () => document.removeEventListener('visibilitychange');
  }, [
    // connect,
    // disconnect,
    setupConnect,
    buildTheme,
    accessToken,
    authorizeUrl,
  ]);

  return (
    <Container>
      <SwipeableViews
        enableMouseEvents
        style={{flexGrow: 1}}
        containerStyle={{height: '100%'}}
        slideClassName="Container"
        index={currentTabIndex}
        onChangeIndex={setCurrentTabIndex}
      >
        <ContainerDiv>
          <ControlsDiv>
            <IconButton children={<RadioRounded />} onClick={() => api(['hk', 'source', 'Radio']).then(onApi)} />
            <Span size="large">
              <IconButton children={<VolumeDownRounded />} onClick={() => api(['hk', 'volume', 'down']).then(onApi)} />
              <IconButton children={<VolumeUpRounded />} onClick={() => api(['hk', 'volume', 'up']).then(onApi)} />
            </Span>
            <IconButton children={<MusicNoteRounded />} onClick={() => api(['hk', 'source', 'TV']).then(onApi)} />
          </ControlsDiv>
          {authorizeUrl === '' ? (
            activeTrack ? (
              <ContainerDiv>
                {loading && (
                  <LoaderDiv>
                    <LinearProgress color="secondary" />
                    <ButtonBase />
                  </LoaderDiv>
                )}
                <Artwork
                  onClick={() =>
                    api(['soca', 'count']).then(json =>
                      onApi({
                        ...json,
                        message: `${json.clientsCount} client${json.clientsCount > 1 ? 's' : ''} connected`,
                      })
                    )
                  }
                  src={activeTrack.album.images.length > 0 ? activeTrack.album.images[0].url : ''}
                  isPlaying={playing}
                  trackDuration={activeTrack.duration_ms}
                  initProgress={trackProgress}
                  onColorChange={onColorChange}
                />
                <Typography
                  variant="h5"
                  color="primary"
                  onClick={() => api(['spotify', 'addok', activeTrack.uri]).then(onApi)}
                >
                  {activeTrack.name}
                  <ArtistSpan>{activeTrack.artists[0].name}</ArtistSpan>
                </Typography>
                <ControlsDiv>
                  <IconButton
                    children={<NewReleasesRounded />}
                    onClick={() =>
                      emit('play', {
                        context_uri: REACT_APP_SPO_DISCOVER_WEEKLY_URI,
                      })
                    }
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
                    onClick={() =>
                      emit('play', {
                        context_uri: REACT_APP_SPO_LIKES_URI,
                      })
                    }
                  />
                </ControlsDiv>
                <VolumeDiv>
                  <Slider
                    valueLabelDisplay="auto"
                    value={volume}
                    onChange={(e, v) => setVolume(v)}
                    onChangeCommitted={(e, v) => emit('set_volume', v)}
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
          )}
        </ContainerDiv>
        <ControlsGrowDiv>
          <ContainerDiv>
            <IconButton
              children={<BluetoothDisabledRounded />}
              onClick={() => api(['bluetooth', 'reset']).then(onApi)}
            />
            <IconButton
              children={<BluetoothSearchingRounded />}
              onClick={() => api(['bluetooth', 'discover']).then(onApi)}
            />
          </ContainerDiv>
          <Hues onHueClick={onHueClick} palette={palette} />
          <ContainerDiv>
            <IconButton children={<TimerRounded />} onClick={onApi} />
            <IconButton children={<PowerOffRounded />} onClick={onApi} />
          </ContainerDiv>
        </ControlsGrowDiv>
      </SwipeableViews>
      <Tabs
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        value={currentTabIndex}
        onChange={(e, tab) => setCurrentTabIndex(tab)}
      >
        <Tab icon={<MusicNoteRounded />} />
        <Tab icon={<WbIncandescentRounded />} />
      </Tabs>
    </Container>
  );
};
