import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {Autocomplete} from '@material-ui/lab';
import {TextField, Fab, Dialog} from '@material-ui/core';
import {SearchRounded} from '@material-ui/icons';
import {useToggle, useShortcut, useSocket} from 'hooks';
import {Track} from 'models';
import {Suggestion} from 'components';
import {api} from 'utils';

const Container = styled.div`
  position: fixed;
  bottom: 0;
  right: 30px;
`;

const SearchBar = styled(TextField)`
  width: 400px;
  max-width: 80vw;
`;

const SearchDialog = styled(Dialog)`
  .MuiDialog-container {
    align-items: flex-start;
  }
`;

const TallList = styled.ul`
  max-height: 80vh;

  li {
    padding: 2px;
  }
`;

const Bastien = styled(Fab)`
  font-size: 0.6em;
`;

type SearchProps = {};

const Search = React.forwardRef<HTMLDivElement, SearchProps>(({}, ref) => {
  const [isOpen, toggle, open, close] = useToggle(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [, emit] = useSocket();

  const playTrack = ({uri}: Track) => {
    emit('play', {uris: [uri]});
    close();
  };

  useEffect(() => {
    if ('' === searchValue) return;

    let isActive = true;
    (async () => {
      const {result} = await api<Track[]>(['spotify', 'search', searchValue]);

      if (isActive) setTracks(result);
    })();

    return () => {
      isActive = false;
    };
  }, [searchValue]);

  // Prevent default when opening to prevent inputing a S
  useShortcut('KeyS', open, !isOpen);

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
          onChange={(_event, track) => track && playTrack(track)}
          renderInput={props => <SearchBar {...props} ref={ref} variant="outlined" autoFocus />}
          renderOption={track => <Suggestion track={track} />}
        />
      </SearchDialog>
    </Container>
  );
});

export {Search};
