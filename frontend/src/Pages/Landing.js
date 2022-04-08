import Button from "../Components/Button";

export default function Landing(){
    return(
        <>
        
        <div className = 'w-screen h-screen flex justify-center items-center bg-white flex-col gap-24 '>
        <div className=" leading-normal justify-self-start text-center text-5xl font-extrabold  text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 md:text-9xl md:leading-normal  ">
          Paint Together
        </div>
                <div className="w-screen  rounded-xl p-2">
                   <div > 
                   <input  className = 'block relative mx-auto border-2 border-purple-500 rounded-3xl text-center p-3 outline-none  text-xl focus:-translate-y-1 focus:shadow-xl focus:shadow-purple-400 transition-all duration-500'type='input' placeholder="Enter Username"/> 
                   </div>
                  
                </div>
                <div className="justify-self-center flex gap-10">
                      <span onClick={()=>{console.log('create');}}><Button >Create a room</Button></span>
                      <span onClick={()=>{console.log('join');}}><Button>Join a room</Button></span>
                   </div>
        </div>
        </>
    );
}