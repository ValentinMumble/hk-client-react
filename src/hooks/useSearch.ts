import {useContext} from 'react';
import {SearchContext, SearchContextValue} from 'contexts';

const useSearch = (): SearchContextValue => {
  const search = useContext(SearchContext);

  if (!search) throw Error('Search not initialized properly');

  return search;
};

export {useSearch};
