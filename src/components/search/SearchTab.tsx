import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {Avatar, List, TextField} from '@material-ui/core';
import {Artist, ArtistLight, Track} from 'models';
import {api} from 'utils';
import {useSearch, useSocket, useTab} from 'hooks';
import {Suggestion} from 'components';

const Container = styled.div`
  width: 100%;
  height: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SearchField = styled(TextField)`
  margin: 10px 10px 0;
`;

const Suggestions = styled(List)`
  width: 100%;
  overflow-y: auto;
`;

const SearchTab = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artist, setArtist] = useState<Artist>();
  const [search, setSearch] = useSearch();
  const [, emit] = useSocket();
  const [tab] = useTab();

  const fetchTracks = async (search: string) => {
    const {data} = await api<Track[]>(['spotify', 'search', search]);
    setTracks(data);
  };

  const fetchArtist = async ({id}: ArtistLight) => {
    const {
      data: {artist, tracks},
    } = await api<{tracks: Track[]; artist: Artist}>(['spotify', 'artist', id, 'top', 'GB']);
    setTracks(tracks);
    setArtist(artist);
  };

  const handleSearchChange = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => setSearch({value});
  const handleArtistSelect = (artist: ArtistLight) => setSearch(search => ({...search, artist}));
  const playTrack = ({uri}: Track) => emit('play', {uris: [uri]});

  useEffect(() => {
    if ('' === search.value) return;

    setArtist(undefined);
    fetchTracks(search.value);
  }, [search.value]);

  useEffect(() => {
    if (!search.artist) return;

    fetchArtist(search.artist);
  }, [search.artist?.id]);

  useEffect(() => {
    if (!inputRef.current) return;

    if (0 === tab) {
      if (!search.artist) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    } else {
      setSearch(search => ({...search, artist: undefined}));
      inputRef.current.blur();
    }
  }, [tab, artist]);

  return (
    <Container>
      <SearchField
        inputRef={inputRef}
        variant="outlined"
        fullWidth={true}
        label={artist?.name}
        value={search.value}
        onChange={handleSearchChange}
        InputProps={{
          endAdornment: undefined === artist ? undefined : <Avatar src={artist.images[0].url} alt={artist.name} />,
        }}
      />
      <Suggestions>
        {tracks.map(track => (
          <Suggestion key={track.uri} track={track} onTrackSelect={playTrack} onArtistSelect={handleArtistSelect} />
        ))}
      </Suggestions>
    </Container>
  );
};

export {SearchTab};
