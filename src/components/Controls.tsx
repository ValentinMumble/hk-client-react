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
import {useSnackbar} from 'contexts';
import {Span, Emoji} from 'components';
import {PlayerState} from 'models';
import {emit} from 'components/Spotify';

const {
  REACT_APP_SPO_DISCOVER_WEEKLY_URI: DISCO = '',
  REACT_APP_SPO_LIKES_URI: LIKES = '',
  REACT_APP_SPO_OK_URI: OK = '',
  REACT_APP_SPO_PI_ID: PI = '',
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
  io: SocketIOClient.Socket;
  isPlaying: boolean;
  setPlaying: Dispatch<SetStateAction<boolean>>;
};

const Controls = ({io, isPlaying, setPlaying}: ControlsProps) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement>();
  const [volume, setVolume] = useState<number>(0);

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

  useEffect(() => {
    if (io) {
      io.on('volume_change', setVolume);
      io.on('initial_state', ({device: {volume_percent}}: PlayerState) => setVolume(volume_percent));
    }
  }, [io]);

  return (
    <>
      <ControlsContainer>
        <IconButton
          children={<SpeakerRounded />}
          onClick={() => emit('transfer_playback', {id: PI, play: isPlaying})}
        />
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
      <Volume
        valueLabelDisplay="auto"
        value={volume}
        onChange={(_e, v) => setVolume(Number(v))}
        onChangeCommitted={(_e, v) => emit('set_volume', Number(v))}
      />
    </>
  );
};

export {Controls};
