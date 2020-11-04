import React, {ReactElement, SyntheticEvent, useState} from 'react';
import styled from 'styled-components';
import {Avatar, IconButton} from '@material-ui/core';
import {ThemedComponentProps} from '@material-ui/core/styles/withTheme';
import {PlaylistAddCheckRounded, PlaylistAddRounded} from '@material-ui/icons';
import {Artist, Track} from 'models';
import {api} from 'utils';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const Tune = styled.div`
  flex: 1;
`;

const ArtistName = styled.div`
  opacity: 0.7;
  font-size: 0.7em;
`;

const Buttons = styled.div`
  display: flex;
  font-size: 1.5em;
  margin-left: 16px;
`;

const AvatarButton = styled(IconButton)`
  .MuiAvatar-root {
    background-color: ${({theme}: ThemedComponentProps) => theme?.palette.primary.main};
  }

  :disabled img {
    mix-blend-mode: luminosity;
  }
`;

enum State {
  NOT_ADDED,
  ADDED,
  LOADING,
}

type SuggestionProps = {
  track: Track;
  onArtistSelect: (artist: Artist, tracks: Track[]) => void;
};

const Suggestion = ({track, onArtistSelect}: SuggestionProps) => {
  const [state, setState] = useState<State>(State.NOT_ADDED);
  const [isArtistLoading, setArtistLoading] = useState<boolean>(false);
  const lightArtist = track.artists[0];

  const handleArtist = async (event: SyntheticEvent) => {
    event.stopPropagation();
    setArtistLoading(true);
    const {
      result: {artist, tracks},
    } = await api<{tracks: Track[]; artist: Artist}>(['spotify', 'artist', lightArtist.id, 'top', 'GB']);
    setArtistLoading(false);
    onArtistSelect(artist, tracks);
  };

  const handleQueue = async (event: SyntheticEvent) => {
    event.stopPropagation();
    setState(State.LOADING);
    const {status} = await api(['spotify', 'queue', track.uri]);
    setState(204 === status ? State.ADDED : State.NOT_ADDED);
  };

  const getIcon = (): ReactElement => {
    switch (state) {
      case State.ADDED:
        return <PlaylistAddCheckRounded />;
      case State.NOT_ADDED:
      case State.LOADING:
        return <PlaylistAddRounded />;
    }
  };

  return (
    <Container>
      <AvatarButton
        disabled={isArtistLoading}
        onClick={handleArtist}
        children={<Avatar src={track.album.images[0].url} alt={lightArtist.name} />}
      />
      <Tune>
        {track.name}
        <ArtistName>{lightArtist.name}</ArtistName>
      </Tune>
      <Buttons>
        <IconButton color="inherit" disabled={State.NOT_ADDED !== state} onClick={handleQueue} children={getIcon()} />
      </Buttons>
    </Container>
  );
};

export {Suggestion};
