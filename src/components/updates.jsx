export default function Updates(props) {
	return (
		<>
			<div className="updates w-full h-auto p-4 bg-transparent text-gray-300 border border-[#e5e7eb] rounded-xl flex flex-col gap-2">
				<div className="flex items-start justify-between gap-2">
					<p className="text-base sm:text-lg font-semibold">{props.title}</p>
					<p className="text-xs text-[#72ff70]">{props.flag}</p>
				</div>
				<p className="text-sm text-gray-200">{props.details}</p>
				<p className="text-xs text-gray-400">{props.meta}</p>
				{props.link ? (
					<a
						href={props.link}
						target="_blank"
						rel="noreferrer"
						className="text-xs text-blue-300 underline"
					>
						open source event
					</a>
				) : null}
			</div>
		</>
	);
}
