import {useContext} from 'react';
import {TabContext, TabContextValue} from 'contexts';

const useTab = (): TabContextValue => {
  const tab = useContext(TabContext);

  if (!tab) throw Error('Tab not initialized properly');

  return tab;
};

export {useTab};
