import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import PageRoutes from './Routes';
import { socket, SocketContext } from './Utils/Socketprovider';

ReactDOM.render(
    <BrowserRouter>
    <SocketContext.Provider value = {socket}>
      <PageRoutes />
    </SocketContext.Provider>
    </BrowserRouter>
  ,
  document.getElementById('root')
);
