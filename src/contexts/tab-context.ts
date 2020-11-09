import {createContext, Dispatch, SetStateAction} from 'react';

type TabContextValue = [number, Dispatch<SetStateAction<number>>];

const TabContext = createContext<TabContextValue | undefined>(undefined);

export type {TabContextValue};
export {TabContext};
