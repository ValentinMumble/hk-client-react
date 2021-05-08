import {ChangeEvent, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {Avatar, List, TextField} from '@material-ui/core';
import {MusicNoteRounded} from '@material-ui/icons';
import {Artist, ArtistLight, Track, Album} from 'models';
import {api} from 'utils';
import {useSearch, useTab} from 'hooks';
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

const Placeholder = styled(MusicNoteRounded)`
  font-size: 4em;
  height: 80%;
  opacity: 0.4;
`;

const SearchTab = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artist, setArtist] = useState<Artist>();
  const [album, setAlbum] = useState<Album>();
  const [search, setSearch] = useSearch();
  const [tab, setTab] = useTab();

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

  const fetchAlbumTracks = async (album: Album) => {
    setAlbum(album);
    const {data} = await api<Track[]>(['spotify', 'album', album.id]);
    setTracks(data);
  };

  const handleSearchChange = ({target: {value}}: ChangeEvent<HTMLInputElement>) => setSearch({value});
  const handleArtistSelect = (artist: ArtistLight) => setSearch(({value}) => ({value, artist}));
  const handleAlbumSelect = (album: Album) => setSearch(({value}) => ({value, album}));
  const playTrack = async ({uri}: Track) => {
    setTab(1);
    await api(['spotify', 'play', uri], {withRadio: true});
  };

  useEffect(() => {
    if ('' === search.value) return;

    setArtist(undefined);
    setAlbum(undefined);
    fetchTracks(search.value);
  }, [search.value]);

  useEffect(() => {
    if (!search.artist) return;

    setAlbum(undefined);
    fetchArtist(search.artist);
  }, [search.artist?.id]);

  useEffect(() => {
    if (!search.album) return;

    setArtist(undefined);
    fetchAlbumTracks(search.album);
  }, [search.album?.id]);

  useEffect(() => {
    if (!inputRef.current) return;

    if (0 === tab) {
      if (!search.artist && !search.album) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    } else {
      inputRef.current.blur();
    }
  }, [tab, artist]);

  const endAdornment =
    undefined !== artist ? (
      <Avatar src={artist.images[0]?.url} alt={artist.name} />
    ) : undefined !== album ? (
      <Avatar src={album.images[0]?.url} alt={album.name} />
    ) : undefined;

  return (
    <Container>
      <SearchField
        inputRef={inputRef}
        variant="outlined"
        fullWidth={true}
        label={artist?.name ?? album?.name}
        value={search.value}
        onChange={handleSearchChange}
        InputProps={{endAdornment}}
        placeholder="What?"
      />
      {0 < tracks.length ? (
        <Suggestions>
          {tracks.map(track => (
            <Suggestion
              key={track.id}
              track={track}
              album={album}
              onTrackSelect={playTrack}
              onArtistSelect={handleArtistSelect}
              onAlbumSelect={handleAlbumSelect}
            />
          ))}
        </Suggestions>
      ) : (
        <Placeholder color="secondary" />
      )}
    </Container>
  );
};

export {SearchTab};
