import styled from 'styled-components';
import {IconButton} from '@material-ui/core';
import {
  BluetoothDisabledRounded,
  PowerOffRounded,
  BluetoothSearchingRounded,
  TimerRounded,
  OpacityRounded,
  SyncProblemRounded,
  ErrorOutlineRounded,
} from '@material-ui/icons';
import {useSnackedApi} from 'hooks';
import {Hues} from './Hues';

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`;

const ColumnContainer = styled(RowContainer)`
  flex-direction: column;
`;

const LightTab = () => {
  const snackedApi = useSnackedApi<string>();
  const ok = () => '👍';

  return (
    <RowContainer>
      <ColumnContainer>
        <IconButton children={<BluetoothDisabledRounded />} onClick={() => snackedApi(['bluetooth', 'reset'], ok)} />
        <IconButton
          children={<BluetoothSearchingRounded />}
          onClick={() => snackedApi(['bluetooth', 'discover'], ok)}
        />
        <IconButton children={<SyncProblemRounded />} onClick={() => snackedApi(['raspotify', 'restart'], ok)} />
        <IconButton children={<ErrorOutlineRounded />} onClick={() => snackedApi(['reboot'], ok)} />
      </ColumnContainer>
      <Hues />
      <ColumnContainer>
        <IconButton children={<OpacityRounded />} onClick={() => snackedApi(['hk', 'dim'])} />
        <IconButton children={<TimerRounded />} onClick={() => snackedApi(['hk', 'timer'])} />
        <IconButton children={<PowerOffRounded />} onClick={() => snackedApi(['hk', 'off'])} />
      </ColumnContainer>
    </RowContainer>
  );
};

export {LightTab};
