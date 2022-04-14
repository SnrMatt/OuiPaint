import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../Utils/Socketprovider";
export default function Canvasboard(){
    const canvasRef = useRef()
    const healthBarRef = useRef();
    const id = useParams();
    const socket = useContext(SocketContext);
    let total_health = 100,x,y,lastX,lastY,interval,total_time_drawn = 0;
    let total_allowed_time = .3 * 1000

    useEffect(()=>{
        socket.emit('join_room', id);
        let canvas = canvasRef.current, healthbar = healthBarRef.current;
        let ctx = canvas.getContext('2d'), healthCtx = healthbar.getContext('2d');
        ctx.fillStyle='white';
        ctx.fillRect(0,0,canvas.width, canvas.height);
        healthCtx.fillStyle = 'red';
        healthCtx.fillRect(0,0,healthbar.width, healthbar.height);
        healthCtx.fillStyle = '#22BF7B';
        healthCtx.fillRect(0,0, healthbar.width, healthbar.height);
        
        const handleHealthBar = (health) =>{
            healthCtx.fillStyle = 'red';
        healthCtx.fillRect(0,0,healthbar.width, healthbar.height);
        healthCtx.fillStyle = '#22BF7B';
        healthCtx.fillRect(0,0,  healthbar.width - (healthbar.width * health), healthbar.height);
        
        }
        canvas.addEventListener('mousemove', (e)=>{
            x = e.offsetX;
            y = e.offsetY;
        })

        canvas.addEventListener('mousedown', ()=>{
            lastX = x;
            lastY = y;
            interval = setInterval(()=>{
              if(total_time_drawn !== total_allowed_time){
                socket.emit('position', {x: x, y: y, x2: lastX, y2 :lastY})
                if(x != lastX  || y != lastY){
                    total_time_drawn++;
                    total_health = total_time_drawn/total_allowed_time;
                    window.requestAnimationFrame(handleHealthBar(total_health));
                }
                    
              }
              else {
                clearInterval(interval)
              }
            }, 0)


        })
        canvas.addEventListener('mouseup', ()=>{
            clearInterval(interval);
        })
        socket.on('draw',({x,y,x2,y2})=>{
            ctx.fillStyle='black';
           if(lastX !== x || lastY !== y){
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineWidth =5;
            ctx.lineCap = 'round';
            ctx.lineTo(x,y)
            ctx.stroke();
           }
           lastX = x
           lastY = y;
        })

    })
    return(
        <div className="flex">
        <div className = ' flex items-center  justify-center w-1/3 bg-gradient-to-r from-purple-500 to-pink-600 '>
            <div className="h-1/2 w-2/3 bg-white rounded-md shadow-2xl"></div>
        </div>
        <div className="flex flex-col gap-5 justify-center items-center bg-gradient-to-l from-purple-500 to-pink-600 h-screen w-screen">
            <canvas className="rounded-md shadow-2xl" width={1000} height = {500} ref = {canvasRef}/>
            <div >
                <canvas className="rounded-xl shadow-2xl" ref ={healthBarRef} width = {200} height= {40}></canvas>
            </div>
        </div>
        </div>
    );
}