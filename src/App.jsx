import Region from "./components/region";
import Updates from "./components/updates";
export default function App() {
	const APIKEY = process.env.NEWS_API_KEY;
	return (
		<main className="flex min-h-screen flex-col bg-gray-900">
			<nav className="navbar flex h-16 w-full items-center justify-between bg-gray-800 px-6 text-white">
				<span className="DashboardName text-4xl font-extrabold text-[#72ff70]">
					TERRAWIRE
				</span>

				<span className="flex items-center gap-4 text-xl font-light font-data text-gray-200">
					Last updated
					<p className="LastUpdatedTime font-light font-data">2m</p>
					ago
					<a
						href=""
						className="font-medium text-blue-300 underline"
					>
						refetch
					</a>
				</span>
			</nav>

			<section className="flex flex-1 flex-row">
				<div className="sideNavBar w-[20%] border-r border-white p-6 flex flex-col items-center gap-10">
					<span>
						<p className="text-2xl font-semibold text-[#72ff70] font-data">
							Mission Control
						</p>
						<p className="text-gray-600 text-bold text-xl font-data">
							Global event monitor
						</p>
					</span>
					<Region name="Intelligence" />
					<Region name="Seismic" />
					<Region name="Atmospheric" />
					<Region name="Orbital" />
				</div>

				<article className="mainBody w-[80%] flex flex-col p-4">
					<span className="">
						<p className="text-white">Tech signals</p>
					</span>
					<div className="flex">
						<div className=" flex flex-col items-center gap-4 p-6">
							<Updates details="Anthropic announces Claude 3.5 Sonnet" />
						</div>
					</div>
				</article>
			</section>
		</main>
	);
}
