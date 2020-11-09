import React, {ReactElement, SyntheticEvent, useState} from 'react';
import {Avatar, IconButton, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText} from '@material-ui/core';
import {PlaylistAddCheckRounded, PlaylistAddRounded} from '@material-ui/icons';
import {ArtistLight, Track} from 'models';
import {api} from 'utils';

enum State {
  NOT_ADDED,
  ADDED,
  LOADING,
}

const getIcon = (state: State): ReactElement => {
  switch (state) {
    case State.ADDED:
      return <PlaylistAddCheckRounded />;
    case State.NOT_ADDED:
    case State.LOADING:
      return <PlaylistAddRounded />;
  }
};

type SuggestionProps = {
  track: Track;
  onArtistSelect: (artist: ArtistLight) => void;
  onTrackSelect: (track: Track) => void;
};

const Suggestion = ({track, onTrackSelect, onArtistSelect}: SuggestionProps) => {
  const [state, setState] = useState<State>(State.NOT_ADDED);
  const artistLight = track.artists[0];

  const handleTrackSelect = () => onTrackSelect(track);

  const handleArtistSelect = (event: SyntheticEvent) => {
    event.stopPropagation();
    onArtistSelect(artistLight);
  };

  const handleQueue = async () => {
    setState(State.LOADING);
    const {status} = await api(['spotify', 'queue', track.uri]);
    setState(204 === status ? State.ADDED : State.NOT_ADDED);
  };

  return (
    <ListItem button={true} onClick={handleTrackSelect}>
      <ListItemAvatar>
        <IconButton
          onClick={handleArtistSelect}
          children={<Avatar alt={artistLight.name} src={track.album.images[0].url} />}
        />
      </ListItemAvatar>
      <ListItemText primary={track.name} secondary={artistLight.name} />
      <ListItemSecondaryAction>
        <IconButton disabled={State.NOT_ADDED !== state} onClick={handleQueue} children={getIcon(state)} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export {Suggestion};
