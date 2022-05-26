import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/Button";
import { SocketContext } from "../Utils/Socketprovider";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function Landing(){
  let navigate = useNavigate();
  let socket = useContext(SocketContext);

  const [username, setUsername] = useState('');
  const [roomID, setRoomID] = useState('');
  const [popup, setStatus] = useState('opacity-0 -z-10')
  const [popup2, setStatus2] = useState('opacity-0 -z-10')
  const [currentRoundCount, setRoundCount] = useState(1);
  const [wordList, setList] = useState(' ');
  const [lobbyStatus, setLobbyStatus]= useState(null);
  //Request socket server to generate room
  // const RequestRoom = ()=>{
  //     socket.emit('request_room', username);
  // }

  //Display Options

  //Request Validtion of Room ID from socket server
  const joinRoom=()=>{
    socket.emit('validate_room', {id:roomID}, username);
 }

  //Simply handles UI pop up for "join room"
  const handlePopup = ()=>{
    if(popup==='opacity-0 -z-10'){
      setStatus('opacity-100 z-40');
    }
    else{
      setStatus('opacity-0 -z-10');
    }
  }
  const handlePopup2 = ()=>{
    if(popup2==='opacity-0 -z-10'){
      setStatus2('opacity-100 z-40')
    }
    else{
      setStatus2('opacity-0 -z-10')
    }
  }

  const handleCount = (type) =>{
    
    if(currentRoundCount >= 1 && currentRoundCount <= 7){
      if(currentRoundCount === 1 && type === 'sub') {setRoundCount(currentRoundCount+0)}
      
      else if(currentRoundCount === 7 && type === 'add') {setRoundCount(currentRoundCount+0)}
      
      else {
        if(type === 'sub'){
        setRoundCount(currentRoundCount - 2)
      }
      else { setRoundCount(currentRoundCount + 2)} 
    }
      
      
      
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

        <div className={`${popup2}  flex justify-center items-center transition-opacity duration-300 w-screen h-screen fixed `} style = {{backgroundColor: 'rgb(0,0,0,.8)'}}>
                <div className="w-1/2 h-1/2 items-center rounded-3xl bg-white flex relative  ">
                    <div className="w-1/2 h-4/6 flex flex-col justify-center items-center border-r-2 border-gray-400 gap-10 ">
                      <h1 className="text-3xl text-purple-500 font-bold">Total Rounds</h1>
                        <div className="flex gap-1">
                          <button className="bg-black hover:bg-purple-500 transition-all duration-300 px-4 rounded-full " onClick={()=>{handleCount('sub')}}><FontAwesomeIcon className="text-white" icon= {faChevronLeft}/></button>
                          <div className="px-5 py-1 text-2xl">{currentRoundCount}</div>
                          <button className="bg-black  hover:bg-purple-500 transition-all duration-300 px-4 rounded-full" onClick={()=>{handleCount('add')}}><FontAwesomeIcon className="text-white" icon = {faChevronRight}/></button>  
                        </div>
                    </div>
                    <div className="w-1/2 h-5/6">
                        <div className="flex flex-col gap-5 justify-center items-center w-full h-full ">
                        <h1 className="text-3xl text-purple-500 font-bold">Custom Words</h1>
                        <textarea onChange={(e)=>{setList(e.target.value)}} className="border-2 rounded-md border-gray-400 focus:outline-purple-500 w-3/4 resize-none p-2" rows={7} placeholder="Place a comma between each word.&#10;Ex: word1,word2,word3"></textarea>
                        </div>
                    </div>
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 w-auto flex gap-5">
                      <span onClick={()=>{socket.emit('request_room', username, currentRoundCount,wordList)}}><Button>Create</Button></span>
                      <span onClick ={()=>{handlePopup2()}}><Button >Cancel</Button></span>
                      </span>
              </div>
        </div>
        
        <div className = 'w-screen h-screen flex justify-center items-center bg-white flex-col gap-24 '>
        <div className=" leading-normal justify-self-start text-center text-5xl font-extrabold  text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 md:text-9xl md:leading-normal  ">
          Oui Paint
        </div>
                <div className="w-screen  rounded-xl p-2">
                   <div > 
                   <input 
                   className = 'block relative mx-auto border-2 border-purple-500 rounded-3xl text-center p-3 outline-none  text-xl focus:-translate-y-1 focus:shadow-lg focus:shadow-purple-500 transition-all duration-500'type='input' 
                   placeholder="Enter Username"
                   onChange={(evt)=> {setUsername(evt.target.value)}}
                   /> 
                </div>
                  
                </div>
                <div className="justify-self-center flex gap-10">
                      <span onClick={()=>{handlePopup2()}}><Button>Create a room</Button></span>
                      <span onClick={()=>{handlePopup()}}><Button>Join a room</Button></span>
                </div>
        </div>
        </>
    );
}