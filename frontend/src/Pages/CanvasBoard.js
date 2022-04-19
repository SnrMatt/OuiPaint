import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../Utils/Socketprovider";
import UserDisplay from "../Components/UserDisplay";
import UserProfile from "../Components/UserProfile";
export default function Canvasboard(){
    const canvasRef = useRef()
    const healthBarRef = useRef();
    const roomID = useParams();
    const socket = useContext(SocketContext);
    let total_health = 100,x,y,lastX,lastY,interval,total_time_drawn = 0;
    let total_allowed_time = .4 * 1000
    const [lobby, setLobby] = useState(null);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [choice, setChoice] = useState(null);
    useEffect(()=>{

        socket.emit('join_room', roomID);
        socket.on('new_user', (lobby_info, currentUser)=>{
                setLobby(lobby_info);
                setUser(currentUser);
        })
        socket.on('get_role', (user_role)=>{
            setRole(user_role);
            console.log('get_user');
        })
        



        let canvas = canvasRef.current, healthbar = healthBarRef.current;
        let ctx = canvas.getContext('2d'), healthCtx = healthbar.getContext('2d');
        gameSetup(ctx, healthCtx,canvas,healthbar);
        
        // const handleHealthBar = (health) =>{
        //     healthCtx.fillStyle = 'red';
        // healthCtx.fillRect(0,0,healthbar.width, healthbar.height);
        // healthCtx.fillStyle = '#22BF7B';
        // healthCtx.fillRect(0,0,  healthbar.width - (healthbar.width * health), healthbar.height);
        // }
        // canvas.addEventListener('mousemove', (e)=>{
        //     x = e.offsetX;
        //     y = e.offsetY;
        // })
        // canvas.addEventListener('mouseleave', ()=>{
        //     clearInterval(interval)
        // })

        // canvas.addEventListener('mousedown', ()=>{
        //     lastX = x;
        //     lastY = y;
        //     interval = setInterval(()=>{
        //       if(total_time_drawn !== total_allowed_time){
        //         socket.emit('position', {x: x, y: y, x2: lastX, y2 :lastY}, roomID)
        //         if(x !== lastX  || y !== lastY){
        //             total_time_drawn++;
        //             total_health = total_time_drawn/total_allowed_time;
        //             window.requestAnimationFrame(handleHealthBar(total_health));
        //         }
                    
        //       }
        //       else {
        //         clearInterval(interval)
        //       }
        //     }, 0)


        // })
        // canvas.addEventListener('mouseup', ()=>{
        //     clearInterval(interval);
        // })
        // socket.on('draw',({x,y,x2,y2})=>{
        //     ctx.fillStyle='black';
        //    if(lastX !== x || lastY !== y){
        //     ctx.beginPath();
        //     ctx.moveTo(x2, y2);
        //     ctx.lineWidth =5;
        //     ctx.lineCap = 'round';
        //     ctx.lineTo(x,y)
        //     ctx.stroke();
        //    }
        //    lastX = x
        //    lastY = y;
        // }) 

    },[])
    return(
        <>
        <div className="flex">
            <div className="w-1/3 bg-gray-700 max-h-screen flex flex-col ">
                <div className="h-5/6 flex flex-col justify-center">
                    <div className="h-5/6 overflow-hidden overflow-y-auto flex flex-col gap-5 border-r-2 border-gray-600">
                    <div className="relative max-w-xs bg-sky-500 self-end px-5 py-1 text-white mr-2 rounded-xl">
                        This is just a test
                        <span className="absolute right-0 -bottom-5 text-gray-400">SnrPapi</span>
                    </div>
                    <div className="relative max-w-xs bg-gray-500 self-start px-5 py-1 text-white ml-2 rounded-xl">
                        This is just a test
                        <span className="absolute left-0 -bottom-5 text-gray-400">Orkei</span>
                    </div>
                    </div>

                </div>
                
                
                <div className="h-1/6 ">
                    <input
                    onKeyDown={(e)=>{if(e.key = 'Enter'){console.log('enter');}}}
                    className="bg-gray-500 p-2 pl-3 rounded-md  w-4/6 block mx-auto mt-10 text-gray-400 focus:outline-none focus:text-white" 
                    type='text'
                    placeholder="Enter choice.... "/>
                </div>
            </div>




            <div className="flex flex-col gap-5 justify-center items-center bg-gray-700 h-screen w-screen">
                <div className=" flex px-10 h-24 w-1000 gap-4  justify-center  ">
                    {lobby && lobby.map(user=>{return <UserProfile background={user.background}>{user.username}</UserProfile>})}
  
                </div>
                <div className="relative">
                    <canvas className="rounded-md shadow-2xl" width={1000} height = {500} ref = {canvasRef}/>
                <div className="block z-10 top-4 absolute left-1/2 -translate-x-1/2">
                    <canvas className="rounded-xl shadow-2xl" ref ={healthBarRef} width = {200} height= {40}></canvas>
                </div>
                </div>
            </div>
        </div>
        </>
    );
}


function gameSetup(ctx, healthCtx,canvas,healthbar) {
        ctx.fillStyle='white';
        ctx.fillRect(0,0,canvas.width, canvas.height);
        healthCtx.fillStyle = 'red';
        healthCtx.fillRect(0,0,healthbar.width, healthbar.height);
        healthCtx.fillStyle = '#22BF7B';
        healthCtx.fillRect(0,0, healthbar.width, healthbar.height);
}

