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
  border-radius: 50%;
`;

const Artist = styled.div`
  opacity: 0.7;
  font-size: 0.7em;
`;

const SearchDialog = styled(Dialog)`
  .MuiDialog-container {
    align-items: flex-start;
  }
`;

const TallList = styled.ul`
  max-height: 80vh;
`;

const Bastien = styled(Fab)`
  font-size: 0.6em;
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
      <Bastien color="primary" onClick={toggle}>
        <SearchRounded />
      </Bastien>
      <SearchDialog open={isOpen} onClose={close}>
        <Autocomplete
          open={0 < tracks.length}
          options={tracks}
          onClose={close}
          autoHighlight
          filterOptions={x => x}
          ListboxComponent={TallList}
          getOptionLabel={option => option.name}
          onInputChange={(_event, newInputValue) => setSearchValue(newInputValue)}
          onChange={(_event, track) => isTrack(track) && playTrack(track)}
          renderInput={props => <SearchBar {...props} variant="outlined" autoFocus />}
          renderOption={track => (
            <Suggestion>
              <Artwork src={track.album.images[0].url} alt="" />
              <div>
                {track.name}
                <Artist>{track.artists[0].name}</Artist>
              </div>
            </Suggestion>
          )}
        />
      </SearchDialog>
    </Container>
  );
};

export {Search};
