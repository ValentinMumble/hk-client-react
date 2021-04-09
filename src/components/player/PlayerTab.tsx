import styled from 'styled-components';
import {IconButton} from '@material-ui/core';
import {RadioRounded, MusicNoteRounded, VolumeDownRounded, VolumeUpRounded} from '@material-ui/icons';
import {useSnackedApi} from 'hooks';
import {Spotify} from './Spotify';

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`;

const LargeButtons = styled.span`
  font-size: 10vh;
`;

const PlayerTab = () => {
  const snackedApi = useSnackedApi<string>();

  return (
    <>
      <RowContainer>
        <IconButton children={<RadioRounded />} onClick={() => snackedApi(['hk', 'source', 'Radio'])} />
        <LargeButtons>
          <IconButton
            children={<VolumeDownRounded />}
            onClick={() => snackedApi(['hk', 'volume', 'down'], () => '👇')}
          />
          <IconButton children={<VolumeUpRounded />} onClick={() => snackedApi(['hk', 'volume', 'up'], () => '👆')} />
        </LargeButtons>
        <IconButton children={<MusicNoteRounded />} onClick={() => snackedApi(['hk', 'source', 'TV'])} />
      </RowContainer>
      <Spotify />
    </>
  );
};

export {PlayerTab};
