import React, {useState, useCallback} from 'react';
import styled from 'styled-components';
//@ts-ignore
import SwipeableViews from 'react-swipeable-views';
import {IconButton, Tabs, Tab} from '@material-ui/core';
import {
  RadioRounded,
  MusicNoteRounded,
  VolumeDownRounded,
  VolumeUpRounded,
  WbIncandescentRounded,
  Warning,
  BluetoothDisabledRounded,
  PowerOffRounded,
  BluetoothSearchingRounded,
  TimerRounded,
} from '@material-ui/icons';
import {Hues} from 'components';
import {useSnackbar, SnackbarProvider} from 'Snackbar';
import {Spotify} from 'Spotify';
import {HKThemeProvider} from 'Theme';
import {api} from 'utils';

const Span = styled.span<{size?: number | string}>`
  display: flex;
  font-size: ${props => {
    if (Number(props.size)) return props.size + 'vh';
    switch (props.size) {
      case 'large':
        return '10vh';
      default:
        return 'inherit';
    }
  }};
  > .MuiSvgIcon-root {
    margin-right: 10px;
  }
`;

const Container = styled.div`
  font-size: 7vh;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100vw;
  height: 100vh;
`;

const ContainerDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
`;

const ControlsDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: inherit;
  font-size: 5vh;
`;

const PrimaryTab = styled(ContainerDiv)`
  height: calc(100vh - 30px);
`;

const SecondaryTab = styled(ControlsDiv)`
  height: calc(100vh - 30px);
  flex-grow: 1;
`;

const App = () => {
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);

  const snack = useSnackbar();

  const onApi = useCallback(
    json =>
      snack(
        json.error ? (
          <Span>
            <Warning fontSize="small" /> {json.error.message || json.error}
          </Span>
        ) : (
          json.message
        )
      ),
    [snack]
  );

  return (
    <HKThemeProvider>
      <SnackbarProvider>
        <Container>
          <SwipeableViews enableMouseEvents index={currentTabIndex} onChangeIndex={setCurrentTabIndex}>
            <PrimaryTab>
              <ControlsDiv>
                <IconButton children={<RadioRounded />} onClick={() => api(['hk', 'source', 'Radio']).then(onApi)} />
                <Span size="large">
                  <IconButton
                    children={<VolumeDownRounded />}
                    onClick={() => api(['hk', 'volume', 'down']).then(onApi)}
                  />
                  <IconButton children={<VolumeUpRounded />} onClick={() => api(['hk', 'volume', 'up']).then(onApi)} />
                </Span>
                <IconButton children={<MusicNoteRounded />} onClick={() => api(['hk', 'source', 'TV']).then(onApi)} />
              </ControlsDiv>
              <Spotify />
            </PrimaryTab>
            <SecondaryTab>
              <ContainerDiv>
                <IconButton
                  children={<BluetoothDisabledRounded />}
                  onClick={() => api(['bluetooth', 'reset']).then(onApi)}
                />
                <IconButton
                  children={<BluetoothSearchingRounded />}
                  onClick={() => api(['bluetooth', 'discover']).then(onApi)}
                />
              </ContainerDiv>
              <Hues />
              <ContainerDiv>
                <IconButton children={<TimerRounded />} onClick={onApi} />
                <IconButton children={<PowerOffRounded />} onClick={onApi} />
              </ContainerDiv>
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
        </Container>
      </SnackbarProvider>
    </HKThemeProvider>
  );
};

export {App};
