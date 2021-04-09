import {ReactElement, SyntheticEvent, useState} from 'react';
import {Avatar, IconButton, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText} from '@material-ui/core';
import {PlaylistAddCheckRounded, PlaylistAddRounded} from '@material-ui/icons';
import {ArtistLight, Track} from 'models';
import {api} from 'utils';

type State = 'added' | 'not-added' | 'loading';

const getIcon = (state: State): ReactElement => {
  switch (state) {
    case 'added':
      return <PlaylistAddCheckRounded />;
    case 'not-added':
    case 'loading':
      return <PlaylistAddRounded />;
  }
};

type SuggestionProps = {
  track: Track;
  onArtistSelect: (artist: ArtistLight) => void;
  onTrackSelect: (track: Track) => void;
};

const Suggestion = ({track, onTrackSelect, onArtistSelect}: SuggestionProps) => {
  const [state, setState] = useState<State>('not-added');
  const artistLight = track.artists[0];

  const handleTrackSelect = () => onTrackSelect(track);

  const handleArtistSelect = (event: SyntheticEvent) => {
    event.stopPropagation();
    onArtistSelect(artistLight);
  };

  const handleQueue = async () => {
    setState('loading');
    const {status} = await api(['spotify', 'queue', track.uri]);
    setState(204 === status ? 'added' : 'not-added');
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
        <IconButton disabled={'not-added' !== state} onClick={handleQueue} children={getIcon(state)} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export {Suggestion};
