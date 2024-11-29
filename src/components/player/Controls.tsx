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
  ShuffleRounded,
  RepeatRounded,
  RepeatOneRounded,
} from '@material-ui/icons';
import {useSnackbar, useSocket, useShortcut, useTab} from 'hooks';
import {api, emojiFirst, label, short} from 'utils';

const ID = 'Controls';

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
`;

const Volume = styled(Slider)`
  margin: 0 10px;

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

const ActiveIcon = styled(IconButton)<{$isActive: boolean}>`
  color: ${({$isActive, theme}) => ($isActive ? theme.palette.primary.main : '#333')};
  font-size: 0.7em;
`;

const CurrentDevice = styled.div`
  position: absolute;
  top: 100%;
  font-size: 0.4em;
  opacity: 0.4;
  font-family: monospace;
`;

type RepeatState = 'off' | 'track' | 'context';

type ControlsProps = {
  isPlaying: boolean;
  setPlaying: Dispatch<SetStateAction<boolean>>;
};

const Controls = ({isPlaying, setPlaying}: ControlsProps) => {
  const [devices, setDevices] = useState<SpotifyApi.UserDevice[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyApi.PlaylistBaseObject[]>([]);
  const [deviceMenuAnchor, setDeviceMenuAnchor] = useState<HTMLElement>();
  const [playlistMenuAnchor, setPlaylistMenuAnchor] = useState<HTMLElement>();
  const [volume, setVolume] = useState<number>(-1);
  const [isShuffle, setShuffle] = useState<boolean>(false);
  const [repeatState, setRepeatState] = useState<RepeatState>('off');
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);

  const currentDevice = devices.find(({id}) => id === currentDeviceId);

  const snack = useSnackbar();
  const [, emit, sub] = useSocket();
  const [tab] = useTab();

  const togglePlayback = () => {
    emit(isPlaying ? 'pause' : 'play');
    setPlaying(!isPlaying);
  };

  const fetchDevices = async () => {
    const {data} = await api<SpotifyApi.UserDevice[]>(['spotify', 'device']);
    setDevices(data);
  };

  const fetchPlaylists = async () => {
    const {data} = await api<SpotifyApi.PlaylistBaseObject[]>(['spotify', 'playlist']);
    setPlaylists(data);
  };

  const toggleShuffle = async () => {
    setShuffle(!isShuffle);
    await api(['spotify', 'shuffle', !isShuffle]);
  };

  const toggleRepeat = async () => {
    const newRepeatState = 'off' === repeatState ? 'track' : 'track' === repeatState ? 'context' : 'off';
    setRepeatState(newRepeatState);
    await api(['spotify', 'repeat', newRepeatState]);
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

  const setDevice = ({id, name}: SpotifyApi.UserDevice) => {
    closeMenus();

    if (null === id || id === currentDeviceId) return;

    emit('transfer_playback', {id, play: isPlaying});
    snack(emojiFirst(`Listening on ${label(name)}`));
  };

  const setPlaylist = ({uri, name}: SpotifyApi.PlaylistBaseObject) => {
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
    sub(
      ID,
      'initial_state',
      ({device: {volume_percent, id}, shuffle_state, repeat_state}: SpotifyApi.CurrentPlaybackResponse) => {
        setShuffle(shuffle_state);
        setRepeatState(repeat_state);
        setVolume(volume_percent ?? 0);
        setCurrentDeviceId(id);
      }
    );
    sub(ID, 'device_change', ({id}: SpotifyApi.UserDevice) => setCurrentDeviceId(id));
    sub(ID, 'shuffle_state', setShuffle);
    sub(ID, 'repeat_state', setRepeatState);
  }, [sub]);

  useEffect(() => {
    fetchPlaylists();
    fetchDevices();
  }, []);

  useShortcut('Space', togglePlayback, 1 === tab, () => 1 === tab);

  return (
    <>
      <ControlsContainer>
        <IconButton onClick={openDeviceMenu}>
          <SpeakerRounded />
          {currentDevice && <CurrentDevice>{short(currentDevice.name)}</CurrentDevice>}
        </IconButton>
        <Menu anchorEl={deviceMenuAnchor} keepMounted={true} open={Boolean(deviceMenuAnchor)} onClose={closeMenus}>
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
        <Menu anchorEl={playlistMenuAnchor} keepMounted={true} open={Boolean(playlistMenuAnchor)} onClose={closeMenus}>
          <MenuItem onClick={playRadio}>📻 Song radio</MenuItem>
          {playlists.map(playlist => (
            <MenuItem key={playlist.id} onClick={() => setPlaylist(playlist)}>
              {label(playlist?.name ?? 'unknown')}
            </MenuItem>
          ))}
        </Menu>
      </ControlsContainer>
      <ControlsContainer>
        <ActiveIcon $isActive={isShuffle} children={<ShuffleRounded />} onClick={toggleShuffle} />
        <Volume
          valueLabelDisplay="auto"
          value={volume}
          onChange={(_event, volume) => setVolume(Number(volume))}
          onChangeCommitted={(_event, volume) => emit('set_volume', Number(volume))}
        />
        <ActiveIcon
          $isActive={'off' !== repeatState}
          children={'track' === repeatState ? <RepeatOneRounded /> : <RepeatRounded />}
          onClick={toggleRepeat}
        />
      </ControlsContainer>
    </>
  );
};

export {Controls};
