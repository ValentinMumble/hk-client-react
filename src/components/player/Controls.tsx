import {useEffect, useState, MouseEvent, Dispatch, SetStateAction} from 'react';
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
import {useSnackbar, useSocket, useShortcut, useTab} from 'hooks';
import {PlayerState, Device, Playlist} from 'models';
import {api, emojiFirst, label} from 'utils';

const ID = 'Controls';

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

  const snack = useSnackbar();
  const [, emit, sub] = useSocket();
  const [tab] = useTab();

  const togglePlayback = () => {
    emit(isPlaying ? 'pause' : 'play');
    setPlaying(!isPlaying);
  };

  const fetchDevices = async () => {
    const {data} = await api<Device[]>(['spotify', 'device']);
    setDevices(data);
  };

  const fetchPlaylists = async () => {
    const {data} = await api<Playlist[]>(['spotify', 'playlist']);
    setPlaylists(data);
  };

  const openDeviceMenu = async (event: MouseEvent<HTMLButtonElement>) => {
    const target = event.currentTarget;
    await fetchDevices();
    setDeviceMenuAnchor(target);
  };

  const openPlaylistMenu = (event: MouseEvent<HTMLButtonElement>) => setPlaylistMenuAnchor(event.currentTarget);
  const closeMenus = () => {
    setDeviceMenuAnchor(undefined);
    setPlaylistMenuAnchor(undefined);
  };

  const setDevice = ({id, name}: Device) => {
    closeMenus();

    if (id === currentDeviceId) return;

    emit('transfer_playback', {id, play: isPlaying});
    snack(emojiFirst(`Listening on ${label(name)}`));
  };

  const setPlaylist = ({uri, name}: Playlist) => {
    emit('play', {context_uri: uri});
    snack(emojiFirst(`Playing ${label(name)}`));
    closeMenus();
  };

  const playRadio = () => {
    api(['spotify', 'radio']);
    snack('📻 Playing song radio');
    closeMenus();
  };

  useEffect(() => {
    sub(ID, 'volume_change', setVolume);
    sub(ID, 'initial_state', ({device: {volume_percent, id}}: PlayerState) => {
      setVolume(volume_percent);
      setCurrentDeviceId(id);
    });
    sub(ID, 'device_change', ({id}: Device) => setCurrentDeviceId(id));
  }, [sub]);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  useShortcut('Space', togglePlayback, 1 === tab, () => 1 === tab);

  return (
    <>
      <ControlsContainer>
        <IconButton children={<SpeakerRounded />} onClick={openDeviceMenu} />
        <Menu anchorEl={deviceMenuAnchor} keepMounted open={Boolean(deviceMenuAnchor)} onClose={closeMenus}>
          {devices.map(device => (
            <MenuItem selected={currentDeviceId === device.id} key={device.id} onClick={() => setDevice(device)}>
              {label(device.name)}
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
          <MenuItem onClick={playRadio}>📻 Song radio</MenuItem>
          {playlists.map(playlist => (
            <MenuItem key={playlist.id} onClick={() => setPlaylist(playlist)}>
              {label(playlist.name)}
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
