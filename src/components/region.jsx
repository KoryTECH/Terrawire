export default function Region(props) {
	return (
		<>
			<div className="w-[70%] h-10 text-white active:bg-[#31353c] font-bold rounded-sm border-l-8 <!-- border-[#00e639]--> flex justify-start items-center text-xl px-4">
				{props.name}
			</div>
		</>
	);
}
