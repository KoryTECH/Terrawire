export default function Updates(props){
    return(
        <>
            <div className="updates w-full h-24 p-4 bg-transparent text-gray-300 border border-[#e5e7eb] rounded-xl flex text-2xl font-semibold">
                {props.details}
            </div>
        </>
    )
}