import {cloneElement} from 'react';
import styled from 'styled-components';
import SwipeableViews from 'react-swipeable-views';
import {Tabs, Tab} from '@material-ui/core';
import {MusicNoteRounded, WbIncandescentRounded, ChatRounded, SearchRounded} from '@material-ui/icons';
import {LightTab, LyricsTab, PlayerTab, SearchTab} from 'components';
import {useShortcut, useSnackedApi, useTab} from 'hooks';

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  height: calc(100vh - 48px); /* minus Tabs' height */
  font-size: 2.5rem;
`;

const App = () => {
  const [tab, setTab] = useTab();
  const snackedApi = useSnackedApi();

  const fetchClientCount = () => {
    if (1 !== tab) return;

    snackedApi<number>(['soca', 'count'], clientCount =>
      clientCount ? `🤵 ${clientCount} client${clientCount > 1 ? 's' : ''} connected` : '🔌'
    );
  };

  const tabs = [
    {key: 'search', tab: <Tab icon={<SearchRounded />} />, content: <SearchTab />},
    {key: 'player', tab: <Tab onClick={fetchClientCount} icon={<MusicNoteRounded />} />, content: <PlayerTab />},
    {key: 'light', tab: <Tab icon={<WbIncandescentRounded />} />, content: <LightTab />},
    {key: 'lyrics', tab: <Tab icon={<ChatRounded />} />, content: <LyricsTab />},
  ];

  useShortcut('ArrowLeft', () => setTab(index => Math.max(0, index - 1)));
  useShortcut('ArrowRight', () => setTab(index => Math.min(tabs.length - 1, index + 1)));
  useShortcut(
    'KeyS',
    () => setTab(0),
    0 !== tab,
    () => 0 !== tab
  );

  return (
    <>
      <SwipeableViews ignoreNativeScroll={true} enableMouseEvents={true} index={tab} onChangeIndex={setTab}>
        {tabs.map(({key, content}) => (
          <TabContainer key={key}>{content}</TabContainer>
        ))}
      </SwipeableViews>
      <Tabs
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        value={tab}
        onChange={(_event, tab) => setTab(tab)}
      >
        {tabs.map(({key, tab}) => cloneElement(tab, {key}))}
      </Tabs>
    </>
  );
};

export {App};
