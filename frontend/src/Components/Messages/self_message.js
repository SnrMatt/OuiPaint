export default function Self_Message(props){
    return(
        <div className="relative max-w-xs bg-sky-500 self-end px-5 py-1 text-white mr-2 rounded-xl">
                           {props.children}
            <span className="absolute right-0 -bottom-5 text-gray-400">SnrPapi</span>
        </div>
    );
}