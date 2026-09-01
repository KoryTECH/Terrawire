export default function Region(props) {
	const activeClasses = props.active
		? "border-l-8 border-[#00e639] bg-[#31353c]"
		: "border-l-8 border-transparent";

	return (
		<>
			<button
				type="button"
				onClick={props.onClick}
				className={`w-full sm:w-[70%] min-h-10 text-white font-bold rounded-sm flex justify-between items-center text-xl px-4 ${activeClasses}`}
			>
				<span>{props.name}</span>
				<span className="text-xs text-gray-300">{props.count}</span>
			</button>
		</>
	);
}
