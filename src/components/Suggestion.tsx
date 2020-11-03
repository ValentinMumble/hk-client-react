import React, {ReactElement, SyntheticEvent, useState} from 'react';
import styled from 'styled-components';
import {Avatar, IconButton} from '@material-ui/core';
import {PlaylistAddCheckRounded, PlaylistAddRounded} from '@material-ui/icons';
import {Track} from 'models';
import {api} from 'utils';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const Tune = styled.div`
  flex: 1;
`;

const Artist = styled.div`
  opacity: 0.7;
  font-size: 0.7em;
`;

const Buttons = styled.div`
  display: flex;
  font-size: 1.5em;
  margin-left: 16px;
`;

enum State {
  NOT_ADDED,
  ADDED,
  LOADING,
}

type SuggestionProps = {
  track: Track;
};

const Suggestion = ({track}: SuggestionProps) => {
  const [state, setState] = useState<State>(State.NOT_ADDED);

  const handleArtist = (event: SyntheticEvent) => {
    event.stopPropagation();
    console.log('TODO');
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
      <IconButton
        size="medium"
        onClick={handleArtist}
        children={<Avatar src={track.album.images[0].url} alt={track.artists[0].name} />}
      />
      <Tune>
        {track.name}
        <Artist>{track.artists[0].name}</Artist>
      </Tune>
      <Buttons>
        <IconButton color="inherit" disabled={State.NOT_ADDED !== state} onClick={handleQueue} children={getIcon()} />
      </Buttons>
    </Container>
  );
};

export {Suggestion};
