import React, {useEffect, useState, MouseEvent, Dispatch, SetStateAction} from 'react';
import styled from 'styled-components';
import {IconButton, Menu, MenuItem, Slider} from '@material-ui/core';
import {
  SkipPreviousRounded,
  PlayArrowRounded,
  PauseRounded,
  SkipNextRounded,
  QueueMusicRounded,
  SpeakerRounded,
} from '@material-ui/icons';
import {useSnackbar, useSocket} from 'contexts';
import {Span} from 'components';
import {PlayerState, Device, Playlist} from 'models';
import {emit} from 'components/Spotify';
import {api} from 'utils';

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
  const [volume, setVolume] = useState<number>(0);

  const snack = useSnackbar();
  const soca = useSocket();

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
    emit(soca, 'transfer_playback', {id: device.id, play: isPlaying});
    snack(`Listening on ${labels[device.name] || device.name}`);
    closeMenus();
  };

  const setPlaylist = (playlist: Playlist) => {
    emit(soca, 'play', {context_uri: playlist.uri});
    snack(`Playing ${labels[playlist.name] || playlist.name}`);
    closeMenus();
  };

  useEffect(() => {
    if (!soca) return;

    soca.on('volume_change', setVolume);
    soca.on('initial_state', ({device: {volume_percent}}: PlayerState) => setVolume(volume_percent));

    fetchDevices();
    fetchPlaylists();
  }, [soca]);

  return (
    <>
      <ControlsContainer>
        <IconButton children={<SpeakerRounded />} onClick={openDeviceMenu} />
        <Menu anchorEl={deviceMenuAnchor} keepMounted open={Boolean(deviceMenuAnchor)} onClose={closeMenus}>
          {devices.map(device => (
            <MenuItem key={device.id} onClick={() => setDevice(device)}>
              {labels[device.name] || device.name}
            </MenuItem>
          ))}
        </Menu>
        <IconButton children={<SkipPreviousRounded />} onClick={() => emit(soca, 'previous_track')} />
        <Span size="large">
          <IconButton
            children={isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
            onClick={() => {
              emit(soca, isPlaying ? 'pause' : 'play');
              setPlaying(!isPlaying);
            }}
          />
        </Span>
        <IconButton children={<SkipNextRounded />} onClick={() => emit(soca, 'next_track')} />
        <IconButton children={<QueueMusicRounded />} onClick={openPlaylistMenu} />
        <Menu anchorEl={playlistMenuAnchor} keepMounted open={Boolean(playlistMenuAnchor)} onClose={closeMenus}>
          {playlists.map(playlist => (
            <MenuItem key={playlist.uri} onClick={() => setPlaylist(playlist)}>
              {labels[playlist.name] || playlist.name}
            </MenuItem>
          ))}
        </Menu>
      </ControlsContainer>
      <Volume
        valueLabelDisplay="auto"
        value={volume}
        onChange={(_e, v) => setVolume(Number(v))}
        onChangeCommitted={(_e, v) => emit(soca, 'set_volume', Number(v))}
      />
    </>
  );
};

export {Controls};
