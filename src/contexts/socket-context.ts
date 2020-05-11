import {createContext} from 'react';

type Primitive = string | number | boolean;
type Payload = Primitive | {[key: string]: Primitive};
type SocketContextValue = [
  SocketIOClient.Socket,
  (event: string, payload?: Payload) => void,
  (key: string, event: string, callback: Function) => void
];

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export type {SocketContextValue, Payload};
export {SocketContext};
