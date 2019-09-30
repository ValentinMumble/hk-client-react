import React, { Component } from 'react';
import './App.css';
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
import Artwork from './Artwork';
import Hues from './Hues';

const { REACT_APP_SERVER_URL: SERVER, REACT_APP_HK_API: HK } = process.env;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
        <span className='Warning'>
          <Warning fontSize='small' /> {json.error.message || json.error}
        </span>
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
    if (document.visibilityState === 'visible' && this.io && this.io.disconnected) {
      console.info('Socket disconnected, reconnecting now...');
      this.setState({ loading: true });
      this.io.open();
      this.emit('initiate', { accessToken: this.accessToken });
    }
  };
  render() {
    const { theme, isPlaying, activeTrack, snackbar, tab } = this.state;
    return (
      <ThemeProvider theme={theme}>
        <div className='App'>
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
            <div className='Container'>
              <div className='Controls Small'>
                <IconButton onClick={() => api(`${HK}/source/Radio`).then(this.onApi)}>
                  <RadioRounded />
                </IconButton>
                <span className='Large'>
                  <IconButton onClick={() => api(`${HK}/volume/down`).then(this.onApi)}>
                    <VolumeDownRounded />
                  </IconButton>
                  <IconButton onClick={() => api(`${HK}/volume/up`).then(this.onApi)}>
                    <VolumeUpRounded />
                  </IconButton>
                </span>
                <IconButton onClick={() => api(`${HK}/source/TV`).then(this.onApi)}>
                  <MusicNoteRounded />
                </IconButton>
              </div>
              {this.state.authorized ? (
                activeTrack ? (
                  <div className='Container'>
                    {this.state.loading && (
                      <div className='Loader'>
                        <LinearProgress color='secondary' />
                        <ButtonBase />
                      </div>
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
                      progress={this.state.progress}
                      onColorChange={palette =>
                        this.setState({
                          palette,
                          theme: withPrimary(palette[0], palette[1])
                        })
                      }
                    />
                    <Typography
                      className='Title'
                      variant='h5'
                      color='primary'
                      onClick={() => api(`${SERVER}/spotify/addok/${activeTrack.uri}`).then(this.onApi)}>
                      {activeTrack.name}
                      <br />
                      <span className='Artist'>{activeTrack.artists[0].name}</span>
                    </Typography>
                    <div className='Controls Small'>
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
                      <span className='Large'>
                        <IconButton onClick={() => this.emit(isPlaying ? 'pause' : 'play')}>
                          {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
                        </IconButton>
                      </span>
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
                    </div>
                    <div className='Volume'>
                      <Slider
                        valueLabelDisplay='auto'
                        value={this.state.volume}
                        onChange={(e, v) => this.setVolume(v)}
                        onChangeCommitted={(e, v) => this.emit('set_volume', v)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className='Container'>{this.state.error}</div>
                )
              ) : (
                <div className='Controls Large'>
                  <IconButton onClick={() => this.login().then(this.setupConnect)}>
                    <LockRounded />
                  </IconButton>
                </div>
              )}
            </div>
            <div className='Controls Grow'>
              <div className='Container'>
                <IconButton onClick={() => api(`${SERVER}/bluetooth/reset`).then(this.onApi)}>
                  <BluetoothDisabledRounded />
                </IconButton>
                <IconButton onClick={() => api(`${SERVER}/bluetooth/discover`).then(this.onApi)}>
                  <BluetoothSearchingRounded />
                </IconButton>
              </div>
              <Hues onHueClick={this.onHueClick} palette={this.state.palette} />
              <div className='Container'>
                <IconButton onClick={this.onApi}>
                  <TimerRounded />
                </IconButton>
                <IconButton onClick={this.onApi}>
                  <PowerOffRounded />
                </IconButton>
              </div>
            </div>
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
        </div>
      </ThemeProvider>
    );
  }
}
export default App;
