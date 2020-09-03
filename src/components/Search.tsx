import React, {useState, useEffect} from 'react';
import {Autocomplete} from '@material-ui/lab';
import {TextField, Fab, Dialog} from '@material-ui/core';
import {SearchRounded} from '@material-ui/icons';
import {useToggle, useShortcut, useSocket} from 'hooks';
import {Track, isTrack} from 'models';
import {api} from 'utils';
import styled from 'styled-components';

const Container = styled.div`
  position: fixed;
  bottom: 0;
  right: 30px;
`;

const SearchBar = styled(TextField)`
  width: 400px;
  max-width: 80vw;
`;

const Suggestion = styled.div`
  display: flex;
  align-items: center;
`;

const Artwork = styled.img`
  height: 32px;
  margin-right: 16px;
`;

const Artist = styled.div`
  opacity: 0.7;
  font-size: 0.7em;
`;

const Search = () => {
  const [isOpen, toggle, open, close] = useToggle(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [, emit] = useSocket();

  const playTrack = (track: Track) => {
    emit('play', {uris: [track.uri]});
    close();
  };

  useShortcut('KeyS', open, !isOpen);

  useEffect(() => {
    if ('' === searchValue) return;

    let isActive = true;
    (async () => {
      const {results} = await api<Track>(['spotify', 'search', searchValue]);

      if (isActive) setTracks(results);
    })();

    return () => {
      isActive = false;
    };
  }, [searchValue]);

  return (
    <Container>
      <Fab color="primary" onClick={toggle}>
        <SearchRounded />
      </Fab>
      <Dialog open={isOpen} onClose={close}>
        <Autocomplete
          options={tracks}
          onClose={close}
          autoHighlight
          freeSolo
          getOptionSelected={(option, value) => option.uri === value.uri}
          getOptionLabel={option => option.name}
          onInputChange={(_event, newInputValue) => setSearchValue(newInputValue)}
          onChange={(_event, track) => isTrack(track) && playTrack(track)}
          renderInput={props => <SearchBar {...props} variant="outlined" autoFocus />}
          renderOption={track => (
            <Suggestion>
              <Artwork alt="artwork" src={track.album.images[0].url} />
              <div>
                {track.name}
                <Artist>{track.artists[0].name}</Artist>
              </div>
            </Suggestion>
          )}
        />
      </Dialog>
    </Container>
  );
};

export {Search};
