import React, {useState} from 'react';
import styled from 'styled-components';
//@ts-ignore //TODO
import SwipeableViews from 'react-swipeable-views';
import {IconButton, Tabs, Tab} from '@material-ui/core';
import {
  RadioRounded,
  MusicNoteRounded,
  VolumeDownRounded,
  VolumeUpRounded,
  WbIncandescentRounded,
  BluetoothDisabledRounded,
  PowerOffRounded,
  BluetoothSearchingRounded,
  TimerRounded,
} from '@material-ui/icons';
import {Hues, Span} from 'components';
import {Spotify} from 'Spotify';
import {useSnackedApi} from 'hooks';

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`;

const ColumnContainer = styled(RowContainer)`
  flex-direction: column;
`;

const TabContainer = styled(ColumnContainer)`
  height: calc(100vh - 30px); /* 30px is Tabs' height */
`;

const SecondaryTab = styled(TabContainer)`
  flex-direction: row;
`;

const App = () => {
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);
  const snackedApi = useSnackedApi();

  return (
    <>
      <SwipeableViews enableMouseEvents index={currentTabIndex} onChangeIndex={setCurrentTabIndex}>
        <TabContainer>
          <RowContainer>
            <IconButton children={<RadioRounded />} onClick={() => snackedApi(['hk', 'source', 'Radio'])} />
            <Span size="large">
              <IconButton
                children={<VolumeDownRounded />}
                onClick={() => snackedApi(['hk', 'volume', 'down'], '👍', 'transparent')}
              />
              <IconButton
                children={<VolumeUpRounded />}
                onClick={() => snackedApi(['hk', 'volume', 'up'], '👍', 'transparent')}
              />
            </Span>
            <IconButton children={<MusicNoteRounded />} onClick={() => snackedApi(['hk', 'source', 'TV'])} />
          </RowContainer>
          <Spotify />
        </TabContainer>
        <SecondaryTab>
          <ColumnContainer>
            <IconButton
              children={<BluetoothDisabledRounded />}
              onClick={() => snackedApi(['bluetooth', 'reset'], '👍', 'transparent')}
            />
            <IconButton
              children={<BluetoothSearchingRounded />}
              onClick={() => snackedApi(['bluetooth', 'discover'], '👍', 'transparent')}
            />
          </ColumnContainer>
          <Hues />
          <ColumnContainer>
            <IconButton children={<TimerRounded />} onClick={() => snackedApi(['hk', 'timer'])} />
            <IconButton children={<PowerOffRounded />} onClick={() => snackedApi(['hk', ''])} />
          </ColumnContainer>
        </SecondaryTab>
      </SwipeableViews>
      <Tabs
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        value={currentTabIndex}
        onChange={(_e, tab) => setCurrentTabIndex(tab)}
      >
        <Tab icon={<MusicNoteRounded />} />
        <Tab icon={<WbIncandescentRounded />} />
      </Tabs>
    </>
  );
};

export {App};
