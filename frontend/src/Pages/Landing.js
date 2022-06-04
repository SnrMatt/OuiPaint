import { useContext, useEffect, useState,useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/Button";
import { SocketContext } from "../Utils/Socketprovider";
import { faChevronLeft, faChevronRight,  faGlobeAmericas,faXmark, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faGithub} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function Landing(){
  let navigate = useNavigate();
  let socket = useContext(SocketContext);

  const [username, setUsername] = useState('');
  const [emptyUser, setNameStatus] = useState(false);
  const [roomID, setRoomID] = useState(null);
  const [popup, setStatus] = useState('opacity-0 -z-10')
  const [popup2, setStatus2] = useState('opacity-0 -z-10')
  const [currentRoundCount, setRoundCount] = useState(1);
  const [wordList, setList] = useState(' ');
  const vidRef = useRef();
  const [aboutIsOpen, setAboutState] = useState(false);
  
  //Request socket server to generate room
  const RequestRoom = ()=>{
    if(username  === '' || null){
      setNameStatus(true);
    }
    else socket.emit('request_room', username, currentRoundCount, wordList);
  }

  //Display Options

  //Request Validtion of Room ID from socket server
  const joinRoom=()=>{
    if(username  === '' || null){
      setNameStatus(true);
    }
    
    else socket.emit('validate_room', {id:roomID}, username);
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
  const handleAboutDisplay = ()=>{
    if(aboutIsOpen === true){
      setAboutState(false);
    }
    else setAboutState(true);
  }
  
  const openUrl= (url)=>{

    window.open(url, '_blank')
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
            <div className="h-screen w-screen  bg-transparent flex flex-col  justify-evenly items-center overflow-hidden relative">
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
                  className={` md:w-2/6 w-5/6 h-4/6 bg-gray-300 rounded-md flex flex-col md:flex-row` }>
                      <div className="w-full h-full flex flex-col justify-evenly items-center">
                        {/**-----------------------PopUp UI Inputs----------------------- */}
                        <div className="flex flex-col text-center">
                          Username
                        <input 
                            onKeyUp={(e)=>{setUsername(e.target.value)}}
                            className={`${emptyUser === true? ' border-4 border-red-500': ''} p-2  rounded-full text-center focus:border-purple-500 focus:border-2 focus:shadow-md focus:shadow-purple-400 focus:outline-none transition-all duration-300`} type='text' placeholder="Enter Username"/>
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
                                <span onClick={()=>{RequestRoom()}}><Button>Create</Button></span>
                                <span onClick={()=>{handlePopup()}}><Button>Cancel</Button></span>
                              </div>
                      </div>
                      
                  </div>
              </div>
              {/**-----------------------Join Game UI----------------------- */}
              <div className={` ${popup2} transition-all duration-300 h-screen w-screen bg-fainted absolute top-0 flex justify-center items-center`}>
                <div className=" md:w-2/6 h-4/6 w-5/6 bg-gray-300 rounded-md flex justify-evenly items-center flex-col" >
               
                <div className="flex flex-col text-center">
                  Username
                <input 
                onKeyUp={(e)=>{setUsername(e.target.value)}}
                className={`${emptyUser === true? ' border-4 border-red-500': ''} p-2  rounded-full mb-10 text-center focus:border-purple-500 focus:border-2 focus:shadow-md focus:shadow-purple-400 focus:outline-none transition-all duration-300`}  type='text' placeholder="Enter Username"/>
                  Room ID
                <input 
                onClick={(e)=>{setRoomID(e.target.value)}}
                className="p-2  rounded-full text-center focus:border-purple-500 focus:border-2 focus:shadow-md focus:shadow-purple-400 focus:outline-none transition-all duration-300 " type='text' placeholder="Enter Room ID"/>
                </div>
                <div className="flex w-full justify-evenly">
                  <span onClick={()=>{joinRoom()}}><Button>Join</Button></span>
                  <span onClick={()=>{handlePopup2()}}><Button>Cancel</Button></span>
                </div>
                </div>
              </div>
              <div onClick={()=>{handleAboutDisplay()}} className="absolute bottom-24 md:bottom-10 hover:cursor-pointer right-10 text-4xl text-white"><FontAwesomeIcon icon ={faInfoCircle}/></div>
               {/**-----------------------App Information----------------------- */}
               <div className={`${aboutIsOpen ? '' : 'translate-x-full'} h-screen w-screen md:w-1/4 md:right-0 bg-white absolute top-0 flex flex-col justify-evenly items-center transition-all duration-300`}>
                   <span className="text-xl text-gray-500">Made by <span className="font-bold text-green-600">Mathew Salazar</span></span>
                   <div className="flex text-5xl w-full justify-evenly ">
                      <div onClick={()=>{openUrl('https://twitter.com/SnrMattSalazar') }} className="hover:text-sky-500 hover:cursor-pointer"><FontAwesomeIcon icon ={faTwitter}/></div>
                      <div onClick={()=>{openUrl('https://github.com/SnrMatt')}} className="hover:text-green-500  rounded-full hover:cursor-pointer"><FontAwesomeIcon icon ={faGithub}/></div>
                      <div onClick={()=>{openUrl('https://msalazar.org')}} className="hover:text-blue-700 hover:cursor-pointer relative"><FontAwesomeIcon icon ={faGlobeAmericas}/></div>
                   </div>
                  <div onClick={()=>{handleAboutDisplay()}} className="hover:cursor-pointer w-14 h-14 rounded-full bg-red-500 flex justify-center items-center text-white text-3xl"><FontAwesomeIcon icon={faXmark}/></div>
                  <div className="absolute bottom-24 text-gray-400">Tip: The faster you draw the more ink you get ;P</div>
               </div>
            </div>    
        </>
    );
}