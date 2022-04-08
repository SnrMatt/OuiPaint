import { Route, Routes } from "react-router-dom"
import Canvasboard from "./Pages/CanvasBoard";
import Landing from "./Pages/Landing";
import { socket, SocketContext } from './Utils/Socketprovider';
export default function PageRoutes(){
  return(
    <Routes>
        <Route path = '/' element ={<Landing/>} />
        <Route path = '/gameroom:id' element = {<Canvasboard/>}/>
    </Routes>
  );
}