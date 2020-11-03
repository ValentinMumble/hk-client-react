import React, {ReactElement, useState} from 'react';
import styled from 'styled-components';
import {PlaylistAddCheckRounded, PlaylistAddRounded} from '@material-ui/icons';
import {Track} from 'models';
import {api} from 'utils';
import {IconButton} from '@material-ui/core';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const Tune = styled.div`
  flex: 1;
`;

const Artwork = styled.img`
  height: 32px;
  margin-right: 16px;
  border-radius: 50%;
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

  const addToQueue = async ({uri}: Track) => {
    setState(State.LOADING);
    const {status} = await api(['spotify', 'queue', uri]);
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
      <Artwork src={track.album.images[0].url} alt="" />
      <Tune>
        {track.name}
        <Artist>{track.artists[0].name}</Artist>
      </Tune>
      <Buttons>
        <IconButton
          color="inherit"
          disabled={State.NOT_ADDED !== state}
          onClick={event => {
            event.stopPropagation();
            addToQueue(track);
          }}
          children={getIcon()}
        />
      </Buttons>
    </Container>
  );
};

export {Suggestion};
