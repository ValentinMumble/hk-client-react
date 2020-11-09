import React, {useState, ReactNode} from 'react';
import {TabContext} from 'contexts';

type TabProviderProps = {
  children?: ReactNode;
};

const TabProvider = ({children}: TabProviderProps) => {
  const [tab, setTab] = useState<number>(1);

  return <TabContext.Provider value={[tab, setTab]}>{children}</TabContext.Provider>;
};

export {TabProvider};
