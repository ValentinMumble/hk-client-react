import React, {useState} from 'react';
import styled from 'styled-components';
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
  OpacityRounded,
  ChatRounded,
} from '@material-ui/icons';
import {Hues, Span, Spotify, Lyrics} from 'components';
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
  height: calc(100vh - 48px); /* minus Tabs' height */
  font-size: 5vh;
`;

const SecondaryTab = styled(TabContainer)`
  flex-direction: row;
`;

const App = () => {
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);
  const snackedApi = useSnackedApi<string>();

  return (
    <>
      <SwipeableViews enableMouseEvents index={currentTabIndex} onChangeIndex={setCurrentTabIndex}>
        <TabContainer>
          <RowContainer>
            <IconButton children={<RadioRounded />} onClick={() => snackedApi(['hk', 'source', 'Radio'])} />
            <Span size="large">
              <IconButton
                children={<VolumeDownRounded />}
                onClick={() => snackedApi(['hk', 'volume', 'down'], () => '👇')}
              />
              <IconButton
                children={<VolumeUpRounded />}
                onClick={() => snackedApi(['hk', 'volume', 'up'], () => '👆')}
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
              onClick={() => snackedApi(['bluetooth', 'reset'], () => '👍')}
            />
            <IconButton
              children={<BluetoothSearchingRounded />}
              onClick={() => snackedApi(['bluetooth', 'discover'], () => '👍')}
            />
          </ColumnContainer>
          <Hues />
          <ColumnContainer>
            <IconButton children={<OpacityRounded />} onClick={() => snackedApi(['hk', 'dim'])} />
            <IconButton children={<TimerRounded />} onClick={() => snackedApi(['hk', 'timer'])} />
            <IconButton children={<PowerOffRounded />} onClick={() => snackedApi(['hk', 'off'])} />
          </ColumnContainer>
        </SecondaryTab>
        <TabContainer>
          <Lyrics />
        </TabContainer>
      </SwipeableViews>
      <Tabs
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        value={currentTabIndex}
        onChange={(_, tab) => setCurrentTabIndex(tab)}
      >
        <Tab icon={<MusicNoteRounded />} />
        <Tab icon={<WbIncandescentRounded />} />
        <Tab icon={<ChatRounded />} />
      </Tabs>
    </>
  );
};

export {App};
