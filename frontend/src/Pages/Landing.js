import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/Button";
import { SocketContext } from "../Utils/Socketprovider";
export default function Landing(){
  let navigate = useNavigate();
  let socket = useContext(SocketContext);

  const [username, setUsername] = useState('');
  const [roomID, setRoomID] = useState('');
  const [popup, setStatus] = useState('opacity-0 -z-10')
  
  //Request socket server to generate room
  const RequestRoom = ()=>{
      socket.emit('request_room', username);
  }

  //Request Validtion of Room ID from socket server
  const joinRoom=()=>{
    socket.emit('validate_room', {id:roomID}, username);
 }

  //Simply handles UI pop up for "join room"
  const handlePopup = ()=>{
    if(popup==='opacity-0 -z-10'){
      setStatus('opacity-100 z-40')
    }
    else{
      setStatus('opacity-0 -z-10')
    }
  }


  useEffect(()=>{
    //Listens for response from socket after generating a room
    socket.on('roomID', ({id})=>{
      navigate('/gameroom:' + id);
    })
    //Listens for response after validating Room ID.
    socket.on('validation_response', (found, id)=>{
      if(found !== -1){
       navigate('/gameroom:' + id.id)
      }
    })
  },[])
    return(
        <>
        <div className={`${popup}  flex justify-center items-center transition-opacity duration-300 w-screen h-screen fixed `} style ={{backgroundColor:'rgb(0,0,0,0.8)'}}>
           <div className="bg-white h-3/4 w-3/4 rounded-lg p-5 md:w-1/3 md:h-2/6 transition-all duration-500 flex items-center justify-center gap-10 flex-col" >
           <input 
           className = 'block relative mx-auto border-2 border-purple-500 rounded-3xl text-center p-3 outline-none  text-xl focus:-translate-y-1 focus:shadow-xl focus:shadow-purple-400 transition-all duration-500'type='input' 
           placeholder="Enter Room ID"
           onChange={(evt)=>{setRoomID(evt.target.value)}}
           />
           <div className="flex gap-10 items-end">
           <span  onClick={()=>{joinRoom()}}><Button>OK</Button></span>
            <span onClick={()=>{handlePopup()}}><Button>Cancel</Button></span>
           </div>
           </div>
        </div>
        
        <div className = 'w-screen h-screen flex justify-center items-center bg-white flex-col gap-24 '>
        <div className=" leading-normal justify-self-start text-center text-5xl font-extrabold  text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 md:text-9xl md:leading-normal  ">
          Oui Paint
        </div>
                <div className="w-screen  rounded-xl p-2">
                   <div > 
                   <input 
                   className = 'block relative mx-auto border-2 border-purple-500 rounded-3xl text-center p-3 outline-none  text-xl focus:-translate-y-1 focus:shadow-xl focus:shadow-purple-400 transition-all duration-500'type='input' 
                   placeholder="Enter Username"
                   onChange={(evt)=> {setUsername(evt.target.value)}}
                   /> 
                </div>
                  
                </div>
                <div className="justify-self-center flex gap-10">
                      <span onClick={()=>{RequestRoom()}}><Button >Create a room</Button></span>
                      <span onClick={()=>{handlePopup()}}><Button>Join a room</Button></span>
                </div>
        </div>
        </>
    );
}