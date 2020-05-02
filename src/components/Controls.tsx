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
import {Span, Emoji} from 'components';
import {PlayerState, Device} from 'models';
import {emit} from 'components/Spotify';
import {api} from 'utils';

const {
  REACT_APP_SPO_DISCOVER_WEEKLY_URI: DISCO = '',
  REACT_APP_SPO_LIKES_URI: LIKES = '',
  REACT_APP_SPO_OK_URI: OK = '',
} = process.env;

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
  const [deviceMenuAnchor, setDeviceMenuAnchor] = useState<HTMLElement>();
  const [playlistMenuAnchor, setPlaylistMenuAnchor] = useState<HTMLElement>();
  const [volume, setVolume] = useState<number>(0);

  const snack = useSnackbar();
  const soca = useSocket();

  const fetchDevices = async () => {
    const {results} = await api<Device>(['spotify', 'devices']);
    setDevices(results);
  };

  const openDeviceMenu = (event: MouseEvent<HTMLButtonElement>) => setDeviceMenuAnchor(event.currentTarget);
  const openPlaylistMenu = (event: MouseEvent<HTMLButtonElement>) => setPlaylistMenuAnchor(event.currentTarget);
  const closeMenus = () => {
    setPlaylistMenuAnchor(undefined);
    setDeviceMenuAnchor(undefined);
  };

  const setPlaylist = (uri: string, message: string) => {
    emit(soca, 'play', {context_uri: uri});
    const words = message.split('\n');
    words.splice(1, 0, 'Playing');
    snack(words.join(' '));
    closeMenus();
  };

  //TODO factorize
  const setDevice = (id: string, message: string) => {
    emit(soca, 'transfer_playback', {id, play: isPlaying});
    const words = message.split('\n');
    words.splice(1, 0, 'Playing');
    snack(words.join(' '));
    closeMenus();
  };

  useEffect(() => {
    if (soca) {
      soca.on('volume_change', setVolume);
      soca.on('initial_state', ({device: {volume_percent}}: PlayerState) => setVolume(volume_percent));
      fetchDevices();
    }
  }, [soca]);

  return (
    <>
      <ControlsContainer>
        <IconButton children={<SpeakerRounded />} onClick={openDeviceMenu} />
        <Menu anchorEl={deviceMenuAnchor} keepMounted open={Boolean(deviceMenuAnchor)} onClose={closeMenus}>
          {devices.map(device => (
            <MenuItem key={device.id} onClick={() => setDevice(device.id, device.name)}>
              {device.name}
            </MenuItem>
          ))}
        </Menu>
        <IconButton children={<SkipPreviousRounded />} onClick={() => emit(soca, 'previous_track')} />
        <Span size="large">
          <IconButton
            onClick={() => {
              emit(soca, isPlaying ? 'pause' : 'play');
              setPlaying(!isPlaying);
            }}
          >
            {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
          </IconButton>
        </Span>
        <IconButton children={<SkipNextRounded />} onClick={() => emit(soca, 'next_track')} />
        <IconButton children={<QueueMusicRounded />} onClick={openPlaylistMenu} />
        <Menu anchorEl={playlistMenuAnchor} keepMounted open={Boolean(playlistMenuAnchor)} onClose={closeMenus}>
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
