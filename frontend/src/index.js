import React from 'react';
import {createRoot} from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import PageRoutes from './Routes';
import { socket, SocketContext } from './Utils/Socketprovider';

let container = document.getElementById('root');
let root = createRoot(container);
root.render(
    <BrowserRouter>
    <SocketContext.Provider value = {socket}>
      <PageRoutes />
    </SocketContext.Provider>
    </BrowserRouter>
);
