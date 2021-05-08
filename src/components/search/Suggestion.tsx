import {ReactElement, SyntheticEvent, useState} from 'react';
import styled from 'styled-components';
import {Avatar, IconButton, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText} from '@material-ui/core';
import {AlbumRounded, PlaylistAddCheckRounded, PlaylistAddRounded} from '@material-ui/icons';
import {api} from 'utils';

const Buttons = styled(ListItemSecondaryAction)`
  right: 0;
  font-size: 0.9em;

  button {
    padding: 10px;
  }
`;

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
  track: SpotifyApi.TrackObjectFull;
  album?: SpotifyApi.AlbumObjectSimplified;
  onAlbumSelect: (album: SpotifyApi.AlbumObjectSimplified) => void;
  onArtistSelect: (artist: SpotifyApi.ArtistObjectSimplified) => void;
  onTrackSelect: (track: SpotifyApi.TrackObjectFull) => void;
};

const Suggestion = ({album, track, onAlbumSelect, onTrackSelect, onArtistSelect}: SuggestionProps) => {
  const [state, setState] = useState<State>('not-added');
  const artistLight = track.artists[0];

  const handleTrackSelect = () => onTrackSelect(track);

  const handleArtistSelect = (event: SyntheticEvent) => {
    event.stopPropagation();
    onArtistSelect(artistLight);
  };

  const handleAlbumSelect = (event: SyntheticEvent) => {
    if (!track.album) return;

    event.stopPropagation();
    onAlbumSelect(track.album);
  };

  const handleQueue = async () => {
    setState('loading');
    const {status} = await api(['spotify', 'queue', track.uri]);
    setState(204 === status ? 'added' : 'not-added');
  };

  return (
    <ListItem disableGutters={true} button={true} onClick={handleTrackSelect}>
      <ListItemAvatar>
        <IconButton
          onClick={handleArtistSelect}
          children={<Avatar alt={artistLight.name} src={album ? album.images[0].url : track.album?.images[0].url} />}
        />
      </ListItemAvatar>
      <ListItemText primary={track.name} secondary={artistLight.name} />
      <Buttons>
        {track.album && <IconButton onClick={handleAlbumSelect} children={<AlbumRounded />} />}
        <IconButton disabled={'not-added' !== state} onClick={handleQueue} children={getIcon(state)} />
      </Buttons>
    </ListItem>
  );
};

export {Suggestion};
