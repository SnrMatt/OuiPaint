import { useContext, useEffect, useState,useRef } from "react";
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
  const vidRef = useRef();
  
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
    if(popup ==='opacity-0 -z-10'){
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
    vidRef.current.play();
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
            <div className=" ">
              <video className=" fixed object-cover  top-0 -z-50 min-h-screen min-w-full" ref={vidRef} src='background.mp4' loop autoPlay muted playsInline/>
            </div>
            <div className="h-screen w-screen  bg-transparent flex flex-col  justify-evenly items-center">
              {/**-----------------------OuiPaint----------------------- */}
              <div className="text-7xl md:text-8xl font-bold  text-white">
              OuiPaint
              </div>
              {/**-----------------------Button UI----------------------- */}
              <div className="flex justify-evenly w-full md:w-2/6">
                <div 
                className="cursor-pointer bg-gray-700 p-1 rounded-xl transition-all duration-300 hover:-translate-y-1">
                  <div
                  onClick={()=>{handlePopup()}} 
                  className="text-lg rounded-xl text-white p-2">
                    Create a lobby
                  </div>
                </div>
                <div 
                className="cursor-pointer bg-gray-700 p-1 rounded-xl transition-all duration-300 hover:-translate-y-1">
                  <div 
                  onClick={()=>{handlePopup2()}}
                  className="text-lg rounded-xl text-white p-2">
                    Join a lobby
                  </div>
                </div>
              </div>
              {/**-----------------------PopUp UI----------------------- */}
                {/**-----------------------Create Game UI----------------------- */}
              <div className={`${popup} w-screen h-screen bg-fainted absolute top-0 flex justify-center items-center transition-all duration-300`}>
                  <div 
                  className={` md:w-2/6 w-5/6 h-5/6 bg-gray-300 rounded-md flex flex-col md:flex-row` }>
                      <div className="w-full h-full flex flex-col justify-evenly items-center">
                        {/**-----------------------PopUp UI Inputs----------------------- */}
                        <div className="flex flex-col text-center">
                          Username
                        <input 
                            onKeyUp={(e)=>{setUsername(e.target.value)}}
                            className="p-2  rounded-full text-center focus:border-purple-500 focus:border-2 focus:shadow-md focus:shadow-purple-400 focus:outline-none transition-all duration-300 " type='text' placeholder="Enter Username"/>
                        </div>
                             <textarea 
                              onKeyUp={(e)=>{setList((e.target.value).split(','))}}
                              className="p-3 w-5/6 h-2/6 focus:outline-none focus:border-2 focus:border-purple-500 focus:shadow-md focus:shadow-purple-400 rounded-md transition-all duration-300 resize-none"
                              placeholder="Enter custom words seperated by commas  Ex:Word1,Word2,Word3"
                              />
                              {/**-----------------------Round Setup----------------------- */}
                              <div className="w-1/2 flex flex-col  items-center ">
                                <span className="text-2xl">Rounds</span>
                                <div className="flex justify-evenly items-center  text-xl w-full">
                                  <span 
                                  onClick={()=>{handleCount('sub')}}
                                  className="bg-purple-500 w-10 h-10 flex justify-center items-center rounded-full hover:cursor-pointer active:translate-y-1 transition-all duration-100"><FontAwesomeIcon className="text-white text-xl" icon={faChevronLeft}/></span>
                                  {currentRoundCount}
                                  <span 
                                  onClick={()=>{handleCount('add')}}
                                  className="bg-purple-500 w-10 h-10 flex justify-center items-center rounded-full hover:cursor-pointer active:translate-y-1 transition-all duration-100"><FontAwesomeIcon className="text-white text-xl" icon={faChevronRight}/></span>
                                </div>
                              </div>
                              {/**-----------------------PopUp UI Controls----------------------- */}
                              <div className="flex justify-evenly w-full">
                                <span onClick={()=>{socket.emit('request_room', username, currentRoundCount, wordList); console.log('click');}}><Button>Create</Button></span>
                                <span onClick={()=>{handlePopup()}}><Button>Cancel</Button></span>
                              </div>
                      </div>
                      
                  </div>
              </div>
              {/**-----------------------Join Game UI----------------------- */}
              <div className={` ${popup2} transition-all duration-300 h-screen w-screen bg-fainted absolute top-0 flex justify-center items-center`}>
                <div className=" md:w-2/6 h-5/6 w-5/6 bg-gray-300 rounded-md flex justify-evenly items-center flex-col" >
               
                <div className="flex flex-col text-center">
                  Username
                <input 
                onKeyUp={(e)=>{setUsername(e.target.value)}}
                className="p-2 mb-10 rounded-full text-center focus:border-purple-500 focus:border-2 focus:shadow-md focus:shadow-purple-400 focus:outline-none transition-all duration-300 " type='text' placeholder="Enter Username"/>
                  Room ID
                <input 
                onClick={(e)=>{setRoomID(e.target.value)}}
                className="p-2  rounded-full text-center focus:border-purple-500 focus:border-2 focus:shadow-md focus:shadow-purple-400 focus:outline-none transition-all duration-300 " type='text' placeholder="Enter Room ID"/>
                </div>
                <div className="flex w-full justify-evenly">
                  <span onClick={()=>{joinRoom()}}><Button>Join</Button></span>
                  <div>Room ID</div>
                  <span onClick={()=>{handlePopup2()}}><Button>Cancel</Button></span>
                </div>
                </div>

              </div>
            </div>    
        </>
    );
}