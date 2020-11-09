import React, {useState, ReactNode} from 'react';
import {SearchContext} from 'contexts';
import {Search} from 'models';

type SearchProviderProps = {
  children?: ReactNode;
};

const SearchProvider = ({children}: SearchProviderProps) => {
  const [search, setSearch] = useState<Search>({value: ''});

  return <SearchContext.Provider value={[search, setSearch]}>{children}</SearchContext.Provider>;
};

export {SearchProvider};
