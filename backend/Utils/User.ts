import { Socket } from "socket.io";



class User{
    socket:Socket;

    constructor(socket:Socket){ 
        this.socket= socket;
    }
}
