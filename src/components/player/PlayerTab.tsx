import styled from 'styled-components';
import {IconButton} from '@material-ui/core';
import {RadioRounded, MusicNoteRounded, VolumeDownRounded, VolumeUpRounded, CastRounded} from '@material-ui/icons';
import {useSnackedApi} from 'hooks';
import {Spotify} from './Spotify';

const {REACT_APP_DEFAULT_SOURCE = 'TV'} = process.env;

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  height: 10vh;
`;

const LargeButton = styled(IconButton)`
  font-size: 9vh;
`;

const PlayerTab = () => {
  const snackedApi = useSnackedApi();

  return (
    <>
      <RowContainer>
        <IconButton children={<RadioRounded />} onClick={() => snackedApi(['hk', 'source', 'Radio'])} />
        <LargeButton
          children={<VolumeDownRounded />}
          onClick={() => snackedApi(['hk', 'volume', 'down'], () => '👇')}
        />
        <LargeButton children={<VolumeUpRounded />} onClick={() => snackedApi(['hk', 'volume', 'up'], () => '👆')} />
        <IconButton
          children={<MusicNoteRounded />}
          onClick={() => snackedApi(['hk', 'source', REACT_APP_DEFAULT_SOURCE])}
        />
        <IconButton children={<CastRounded />} onClick={() => snackedApi(['hk', 'source', 'Cable Sat'])} />
      </RowContainer>
      <Spotify />
    </>
  );
};

export {PlayerTab};
