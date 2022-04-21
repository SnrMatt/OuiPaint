export default function Others_Message(props){
    return(
        <div className="relative max-w-xs bg-gray-500 self-start px-5 py-1 text-white ml-2 rounded-xl">
        {props.children}
        <span className="absolute left-0 -bottom-5 text-gray-400">{props.username}</span>
        </div>
    );
}