import React, { Component } from 'react';
import { withPrimary } from './theme';
import { api } from './util';
import openSocket from 'socket.io-client';
import {
  Snackbar,
  Slider,
  LinearProgress,
  IconButton,
  Typography,
  SnackbarContent,
  ButtonBase,
  Tabs,
  Tab
} from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
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
  TimerRounded
} from '@material-ui/icons';
import SwipeableViews from 'react-swipeable-views';
import { Artwork } from './Artwork';
import { Hues } from './Hues';
import styled from 'styled-components';

const { REACT_APP_SERVER_URL: SERVER, REACT_APP_HK_API: HK } = process.env;

const AppDiv = styled.div`
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      snackbar: { opened: false, color: '#000' },
      theme: withPrimary('#000'),
      tab: 0,
      palette: []
    };
  }
  componentDidMount() {
    api(`${SERVER}/spotify/access-token`).then(data => {
      if (data.url) {
        this.setState({
          authorized: false,
          authorizeUrl: data.url,
          theme: withPrimary('#777')
        });
      } else {
        this.setupConnect(data.accessToken);
      }
    });
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }
  setProgress = progress => this.setState({ progress });
  setPlayback = isPlaying => this.setState({ isPlaying });
  setDevice = device => this.setState({ device });
  setVolume = volume => this.setState({ volume });
  setTrack = activeTrack => this.setState({ activeTrack });
  emit = (event, value) => {
    console.info('Emit', event, value);
    this.io.emit(event, value);
    switch (event) {
      case 'play':
        this.setPlayback(true);
        break;
      case 'pause':
        this.setPlayback(false);
        break;
      default:
        break;
    }
  };
  onError = error => {
    if (error.name === 'NoAccessToken') {
      this.emit('initiate', { accessToken: this.accessToken });
    } else if (error.name === 'NoActiveDeviceError') {
      this.setState({ loading: true });
      this.emit('transfer_playback', { id: process.env.REACT_APP_SPO_PI_ID });
    } else if (error === 'The access token expired') {
      this.refreshToken();
    } else if (error === 'Device not found') {
      api(`${SERVER}/spotify/devices`).then(this.onApi);
    } else {
      this.setState({ error: error.message || error });
    }
  };
  refreshToken = () => {
    console.info('Refreshing token...');
    api(`${SERVER}/spotify/refresh-token`).then(data => {
      this.accessToken = data.accessToken;
      this.emit('access_token', this.accessToken);
    });
  };
  login = () => {
    return new Promise((resolve, reject) => {
      const popup = window.open(this.state.authorizeUrl, '_blank', 'width=500,height=500,location=0,resizable=0');
      const listener = setInterval(() => {
        if (popup) popup.postMessage('login', window.location);
      }, 1000);
      window.onmessage = event => {
        if (event.source === popup) {
          clearInterval(listener);
          window.onmessage = null;
          return resolve(JSON.parse(event.data));
        }
      };
    });
  };
  setupConnect = accessToken => {
    this.accessToken = accessToken;
    this.io = openSocket(`${SERVER}/connect`, { reconnection: false });
    const wrappedHandler = (event, handler) => {
      this.io.on(event, data => {
        console.info(event, data);
        handler(data);
      });
    };
    wrappedHandler('initial_state', state =>
      this.setState({
        loading: false,
        authorized: true,
        progress: state.progress_ms,
        activeTrack: state.item,
        volume: state.device.volume_percent,
        device: state.device,
        isPlaying: state.is_playing
      })
    );
    wrappedHandler('track_change', this.setTrack);
    wrappedHandler('seek', this.setProgress);
    wrappedHandler('playback_started', () => this.setPlayback(true));
    wrappedHandler('playback_paused', () => this.setPlayback(false));
    wrappedHandler('device_change', this.setDevice);
    wrappedHandler('volume_change', this.setVolume);
    wrappedHandler('track_end', () => {});
    wrappedHandler('connect_error', this.onError);
    wrappedHandler('disconnect', this.onVisibilityChange);
    this.emit('initiate', { accessToken: this.accessToken });
  };
  snack = (message, duration = 2000, color = this.state.theme.palette.primary.main) => {
    if (message)
      this.setState({
        snackbar: {
          ...this.state.snackbar,
          opened: true,
          message,
          duration,
          color
        }
      });
  };
  onApi = json => {
    this.snack(
      json.error ? (
        <Span>
          <Warning fontSize='small' /> {json.error.message || json.error}
        </Span>
      ) : (
        json.message
      )
    );
  };
  onHueClick = color => {
    if (color) {
      api(`${SERVER}/hue/on/${color.substring(1)}`).then(this.onApi);
      this.snack('Turning lights on...', 1000, color);
    } else {
      api(`${SERVER}/hue/off`).then(this.onApi);
      this.snack('Turning lights off...', 1000, '#000');
    }
  };
  onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      if (this.io && this.io.disconnected) {
        console.info('Socket disconnected, reconnecting now...');
        this.setState({ loading: true });
        this.io.open();
        this.emit('initiate', { accessToken: this.accessToken });
      }
      if (this.disconnectTimeout) {
        clearTimeout(this.disconnectTimeout);
      }
    } else if (document.visibilityState === 'hidden') {
      this.disconnectTimeout = setTimeout(() => {
        console.info('Timeout: disconnecting');
        this.io.close();
        clearTimeout(this.disconnectTimeout);
      }, 5000);
    }
  };
  onColorChange = palette =>
    this.setState({
      palette,
      theme: withPrimary(palette[0], palette[1])
    });
  render() {
    const { theme, isPlaying, activeTrack, snackbar, tab } = this.state;
    return (
      <ThemeProvider theme={theme}>
        <AppDiv>
          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            autoHideDuration={snackbar.duration}
            open={snackbar.opened}
            onClose={() => this.setState({ snackbar: { ...snackbar, opened: false } })}>
            <SnackbarContent
              style={{
                backgroundColor: snackbar.color,
                color: theme.palette.getContrastText(snackbar.color)
              }}
              message={snackbar.message}
            />
          </Snackbar>
          <SwipeableViews
            style={{ flexGrow: 1 }}
            containerStyle={{ height: '100%' }}
            slideClassName='Container'
            index={tab}
            onChangeIndex={tab => this.setState({ tab })}>
            <ContainerDiv>
              <ControlsDiv>
                <IconButton onClick={() => api(`${HK}/source/Radio`).then(this.onApi)}>
                  <RadioRounded />
                </IconButton>
                <Span size='large'>
                  <IconButton onClick={() => api(`${HK}/volume/down`).then(this.onApi)}>
                    <VolumeDownRounded />
                  </IconButton>
                  <IconButton onClick={() => api(`${HK}/volume/up`).then(this.onApi)}>
                    <VolumeUpRounded />
                  </IconButton>
                </Span>
                <IconButton onClick={() => api(`${HK}/source/TV`).then(this.onApi)}>
                  <MusicNoteRounded />
                </IconButton>
              </ControlsDiv>
              {this.state.authorized ? (
                activeTrack ? (
                  <ContainerDiv>
                    {this.state.loading && (
                      <LoaderDiv>
                        <LinearProgress color='secondary' />
                        <ButtonBase />
                      </LoaderDiv>
                    )}
                    <Artwork
                      onClick={() =>
                        api(`${SERVER}/soca/count`).then(json =>
                          this.onApi({
                            ...json,
                            message: `${json.clientsCount} client${json.clientsCount > 1 ? 's' : ''} connected`
                          })
                        )
                      }
                      src={activeTrack.album.images.length > 0 ? activeTrack.album.images[0].url : ''}
                      isPlaying={isPlaying}
                      trackDuration={activeTrack.duration_ms}
                      initProgress={this.state.progress}
                      onColorChange={this.onColorChange}
                    />
                    <Typography
                      variant='h5'
                      color='primary'
                      onClick={() => api(`${SERVER}/spotify/addok/${activeTrack.uri}`).then(this.onApi)}>
                      {activeTrack.name}
                      <ArtistSpan>{activeTrack.artists[0].name}</ArtistSpan>
                    </Typography>
                    <ControlsDiv>
                      <IconButton
                        onClick={() =>
                          this.emit('play', {
                            context_uri: process.env.REACT_APP_SPO_DISCOVER_WEEKLY_URI
                          })
                        }>
                        <NewReleasesRounded />
                      </IconButton>
                      <IconButton onClick={() => this.emit('previous_track')}>
                        <SkipPreviousRounded />
                      </IconButton>
                      <Span size='large'>
                        <IconButton onClick={() => this.emit(isPlaying ? 'pause' : 'play')}>
                          {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
                        </IconButton>
                      </Span>
                      <IconButton onClick={() => this.emit('next_track')}>
                        <SkipNextRounded />
                      </IconButton>
                      <IconButton
                        onClick={() =>
                          this.emit('play', {
                            context_uri: process.env.REACT_APP_SPO_LIKES_URI
                          })
                        }>
                        <FavoriteRounded />
                      </IconButton>
                    </ControlsDiv>
                    <VolumeDiv>
                      <Slider
                        valueLabelDisplay='auto'
                        value={this.state.volume}
                        onChange={(e, v) => this.setVolume(v)}
                        onChangeCommitted={(e, v) => this.emit('set_volume', v)}
                      />
                    </VolumeDiv>
                  </ContainerDiv>
                ) : (
                  <ContainerDiv>{this.state.error}</ContainerDiv>
                )
              ) : (
                <ControlsDiv>
                  <IconButton onClick={() => this.login().then(this.setupConnect)}>
                    <LockRounded />
                  </IconButton>
                </ControlsDiv>
              )}
            </ContainerDiv>
            <ControlsGrowDiv>
              <ContainerDiv>
                <IconButton onClick={() => api(`${SERVER}/bluetooth/reset`).then(this.onApi)}>
                  <BluetoothDisabledRounded />
                </IconButton>
                <IconButton onClick={() => api(`${SERVER}/bluetooth/discover`).then(this.onApi)}>
                  <BluetoothSearchingRounded />
                </IconButton>
              </ContainerDiv>
              <Hues onHueClick={this.onHueClick} palette={this.state.palette} />
              <ContainerDiv>
                <IconButton onClick={this.onApi}>
                  <TimerRounded />
                </IconButton>
                <IconButton onClick={this.onApi}>
                  <PowerOffRounded />
                </IconButton>
              </ContainerDiv>
            </ControlsGrowDiv>
          </SwipeableViews>
          <Tabs
            variant='fullWidth'
            textColor='primary'
            indicatorColor='primary'
            value={tab}
            onChange={(e, tab) => this.setState({ tab })}>
            <Tab icon={<MusicNoteRounded />} />
            <Tab icon={<WbIncandescentRounded />} />
          </Tabs>
        </AppDiv>
      </ThemeProvider>
    );
  }
}
export default App;
