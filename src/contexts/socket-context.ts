import {createContext, useContext} from 'react';

const SocketContext = createContext<SocketIOClient.Socket | undefined>(undefined);

const useSocket = () => useContext(SocketContext);

export {SocketContext, useSocket};
