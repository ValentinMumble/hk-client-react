import {ReactNode, RefObject} from 'react';

type ContentProps = {
  scrollRef?: RefObject<HTMLDivElement>;
  setLoading?: (loading: boolean) => void;
  setContent: (value: ReactNode) => void;
};

export type {ContentProps};
