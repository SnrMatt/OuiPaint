import express from 'express';
import cors from 'cors';
import { Server, Socket } from 'socket.io'
const app = express();
const server = require('http').createServer(app);




const io = new Server(server, {
    cors: {
      origin: `http://localhost:3000`,
    },
  });

io.on('connection', (socket:Socket)=>{
    
})


server.listen(5000 , ()=>{ 
    console.log('Server is on port 5000')
})

