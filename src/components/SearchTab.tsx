import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {List, TextField} from '@material-ui/core';
import {Artist, ArtistLight, Track} from 'models';
import {api} from 'utils';
import {useSearch, useSocket} from 'hooks';
import {Suggestion} from 'components';

const Container = styled.div`
  width: 100%;
  height: 100%;
  max-width: 500px;
`;

const SearchField = styled(TextField)`
  margin-top: 10px;
`;

const SearchTab = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artist, setArtist] = useState<Artist>();
  const [search, setSearch] = useSearch();
  const [, emit] = useSocket();

  const fetchTracks = async (search: string) => {
    const {data} = await api<Track[]>(['spotify', 'search', search]);
    setTracks(data);
  };

  const fetchArtist = async (artistLight: ArtistLight) => {
    const {
      data: {artist, tracks},
    } = await api<{tracks: Track[]; artist: Artist}>(['spotify', 'artist', artistLight.id, 'top', 'GB']);
    setTracks(tracks);
    setArtist(artist);
  };

  const handleSearchChange = ({target: {value}}: React.ChangeEvent<HTMLInputElement>) => setSearch({value});
  const handleArtistSelect = (artist: ArtistLight) => setSearch(search => ({...search, artist}));
  const playTrack = ({uri}: Track) => emit('play', {uris: [uri]});

  useEffect(() => {
    if ('' === search.value) return;

    fetchTracks(search.value);
  }, [search.value]);

  useEffect(() => {
    if (!search.artist) return;

    fetchArtist(search.artist);
  }, [search.artist?.id]);

  return (
    <Container>
      <SearchField
        variant="outlined"
        fullWidth={true}
        label={artist?.name}
        value={search.value}
        onChange={handleSearchChange}
      />
      <List>
        {tracks.map(track => (
          <Suggestion key={track.uri} track={track} onTrackSelect={playTrack} onArtistSelect={handleArtistSelect} />
        ))}
      </List>
    </Container>
  );
};

export {SearchTab};
