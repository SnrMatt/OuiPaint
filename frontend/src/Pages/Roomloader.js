import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../Components/Button";
import { socket } from "../Utils/Socketprovider";
import Canvasboard from "./CanvasBoard";


export default function Roomloader(){
    let navigate = useNavigate();
    const roomID = useParams();
    const [lobbyStatus, setlobbyStatus] = useState(false);
    
   useEffect(()=>{
    setTimeout(()=>{
        socket.emit('check_lobby_status', roomID);
        socket.on('response_lobby_status', (status)=>{
            setlobbyStatus(status)
            console.log('render?');
        })
    }, 2000);
   },[])
    if(lobbyStatus == false){
        return(
        <div className="h-screen w-screen flex justify-center items-center flex-col gap-10">
            <div className=" flex flex-col items-center text-white text-center gap-20">
              
                <div className="h-24 w-24  rounded-full animate-spin  border-4 border-t-black"></div>
            </div>
            <span className="flex flex-col absolute bottom-24 gap-5 text-gray-500">
                If you dont connect to a lobby go back and try again.
                <span
                onClick ={()=>{
                    console.log('click');
                    socket.emit('leave_lobby');
                    navigate('/')}}
                className="bg-red-400  w-auto justify-self-center self-center text-center  px-4 py-2 rounded-md text-3xl hover:cursor-pointer text-white hover:-translate-y-1 transition-all duration-500">LEAVE</span>
            </span>
        </div>);
    }
    else{
        return(
            <>
                <Canvasboard/>
            </>
        );
    }
}