import {createContext, Dispatch, SetStateAction} from 'react';
import {Search} from 'models';

type SearchContextValue = [Search, Dispatch<SetStateAction<Search>>];

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export type {SearchContextValue};
export {SearchContext};
