import React, {useEffect, useState, MouseEvent, Dispatch, SetStateAction, useCallback, useRef} from 'react';
import styled, {css} from 'styled-components';
import {IconButton, Menu, MenuItem, Slider} from '@material-ui/core';
import {
  SkipPreviousRounded,
  PlayArrowRounded,
  PauseRounded,
  SkipNextRounded,
  QueueMusicRounded,
  SpeakerRounded,
} from '@material-ui/icons';
import {useSnackbar, useSocket, useShortcut} from 'hooks';
import {Emoji, Search} from 'components';
import {PlayerState, Device, Playlist, ServerError} from 'models';
import {api, emojiFirst} from 'utils';

const ID = 'Controls';
const labels: {[key: string]: string} = {
  OK: '👌 OK',
  'Discover Weekly': '✨ Discover',
  '<3': '❤️ Likes',
  Pi: '🔈 π',
  MacMumble: '💻 MacMumble',
  'ONEPLUS A6013': '📱 OnePlus',
  'Akeneo Mumble 16': '👾 Akeneo Mumble',
};

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: inherit;
`;

const Volume = styled(Slider)`
  width: 85%;

  ${({value}) =>
    -1 === value &&
    css`
      color: black;
    `}
`;

const PlayPause = styled.span`
  position: relative;
  color: transparent;
  font-size: 10vh;
  outline: none;
`;

const PlayPauseButton = styled.div<{isHidden: boolean}>`
  position: absolute;
  top: 0;
  display: flex;
  transform: scale(${({isHidden}) => (isHidden ? 0 : 1)});
  transition: transform 300ms ease;
`;

type ControlsProps = {
  isPlaying: boolean;
  setPlaying: Dispatch<SetStateAction<boolean>>;
};

const Controls = ({isPlaying, setPlaying}: ControlsProps) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [deviceMenuAnchor, setDeviceMenuAnchor] = useState<HTMLElement>();
  const [playlistMenuAnchor, setPlaylistMenuAnchor] = useState<HTMLElement>();
  const [volume, setVolume] = useState<number>(-1);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const searchRef = useRef<HTMLDivElement>(null);

  const snack = useSnackbar();
  const [, emit, sub] = useSocket();

  const togglePlayback = () => {
    emit(isPlaying ? 'pause' : 'play');
    setPlaying(!isPlaying);
  };

  const fetchDevices = async () => {
    const {results} = await api<Device>(['spotify', 'devices']);
    setDevices(results);
  };

  const fetchPlaylists = async () => {
    const {results} = await api<Playlist>(['spotify', 'playlists']);
    setPlaylists(results);
  };

  const openDeviceMenu = (event: MouseEvent<HTMLButtonElement>) => setDeviceMenuAnchor(event.currentTarget);
  const openPlaylistMenu = (event: MouseEvent<HTMLButtonElement>) => setPlaylistMenuAnchor(event.currentTarget);
  const closeMenus = () => {
    setDeviceMenuAnchor(undefined);
    setPlaylistMenuAnchor(undefined);
  };

  const setDevice = (device: Device) => {
    closeMenus();

    if (device.id === currentDeviceId) return;

    emit('transfer_playback', {id: device.id, play: isPlaying});
    snack(emojiFirst(`Listening on ${labels[device.name] ?? device.name}`));
  };

  const setPlaylist = (playlist: Playlist) => {
    emit('play', {context_uri: playlist.uri});
    snack(emojiFirst(`Playing ${labels[playlist.name] ?? playlist.name}`));
    closeMenus();
  };

  const playRadio = () => {
    api(['spotify', 'radio']);
    snack('📻 Playing song radio');
    closeMenus();
  };

  const handleError = useCallback(
    (error: ServerError) => {
      if ('Device not found' === error.name) {
        snack('😳 Device not found');
        fetchDevices();
      }
    },
    [snack]
  );

  useEffect(() => {
    sub(ID, 'volume_change', setVolume);
    sub(ID, 'initial_state', ({device: {volume_percent, id}}: PlayerState) => {
      setVolume(volume_percent);
      setCurrentDeviceId(id);
    });
    sub(ID, 'device_change', ({id}: Device) => setCurrentDeviceId(id));
    sub(ID, 'connect_error', handleError);
  }, [sub, handleError]);

  useEffect(() => {
    fetchDevices();
    fetchPlaylists();
  }, []);

  useShortcut('Space', togglePlayback, false, () => null === searchRef.current);

  return (
    <>
      <Search ref={searchRef} />
      <ControlsContainer>
        <IconButton children={<SpeakerRounded />} onClick={openDeviceMenu} />
        <Menu anchorEl={deviceMenuAnchor} keepMounted open={Boolean(deviceMenuAnchor)} onClose={closeMenus}>
          {devices.map(device => (
            <MenuItem selected={currentDeviceId === device.id} key={device.id} onClick={() => setDevice(device)}>
              {labels[device.name] ?? device.name}
            </MenuItem>
          ))}
        </Menu>
        <IconButton children={<SkipPreviousRounded />} onClick={() => emit('previous_track')} />
        <PlayPause onClick={togglePlayback}>
          <IconButton color="inherit" children={<PauseRounded />} />
          <PlayPauseButton isHidden={!isPlaying}>
            <IconButton children={<PauseRounded />} />
          </PlayPauseButton>
          <PlayPauseButton isHidden={isPlaying}>
            <IconButton children={<PlayArrowRounded />} />
          </PlayPauseButton>
        </PlayPause>
        <IconButton children={<SkipNextRounded />} onClick={() => emit('next_track')} />
        <IconButton children={<QueueMusicRounded />} onClick={openPlaylistMenu} />
        <Menu anchorEl={playlistMenuAnchor} keepMounted open={Boolean(playlistMenuAnchor)} onClose={closeMenus}>
          <MenuItem onClick={playRadio}>
            <Emoji e="📻" /> Song radio
          </MenuItem>
          {playlists.map(playlist => (
            <MenuItem key={playlist.id} onClick={() => setPlaylist(playlist)}>
              {labels[playlist.name] ?? playlist.name}
            </MenuItem>
          ))}
        </Menu>
      </ControlsContainer>
      <Volume
        valueLabelDisplay="auto"
        value={volume}
        onChange={(_event, volume) => setVolume(Number(volume))}
        onChangeCommitted={(_event, volume) => emit('set_volume', Number(volume))}
      />
    </>
  );
};

export {Controls};
