import { Route, Routes } from "react-router-dom"
import Roomloader from "./Pages/Roomloader";
import Landing from "./Pages/Landing";
export default function PageRoutes(){
  return(
    <Routes>
        <Route path = '/' element ={<Landing/>} />
        <Route path = '/gameroom:id' element = {<Roomloader/>}/>
    </Routes>
  );
}