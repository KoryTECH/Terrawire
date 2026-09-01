import { useEffect, useMemo, useState } from "react";
import { fetchEarthquakeData } from "./api/earthquakes";
import { fetchOpenNaturalEvents } from "./api/eonet";

export default function App() {
	const [earthquakeData, setEarthquakeData] = useState(null);
	const [activeSection, setActiveSection] = useState("Intelligence");
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [lastUpdated, setLastUpdated] = useState(null);
	const [quakeSort, setQuakeSort] = useState("magnitude");
	const [searchText, setSearchText] = useState("");
	const [clock, setClock] = useState(new Date());
	const [naturalEvents, setNaturalEvents] = useState([]);
	const [isNaturalLoading, setIsNaturalLoading] = useState(false);

	async function fetchData(signal) {
		setIsLoading(true);
		setErrorMessage("");
		try {
			const requestOptions = signal ? { signal } : {};
			const data = await fetchEarthquakeData({ limit: "120" }, requestOptions);
			setEarthquakeData(data);
			setLastUpdated(new Date());
		} catch (error) {
			if (error.name !== "AbortError") {
				console.error("Fetch failed:", error);
				setErrorMessage("Unable to load live events right now.");
			}
		} finally {
			setIsLoading(false);
		}
	}

	async function fetchNaturalData(signal) {
		setIsNaturalLoading(true);
		try {
			const requestOptions = signal ? { signal } : {};
			const data = await fetchOpenNaturalEvents({ limit: "8" }, requestOptions);
			setNaturalEvents(data?.events ?? []);
		} catch (error) {
			if (error.name !== "AbortError") {
				console.error("Natural events fetch failed:", error);
				setNaturalEvents([]);
			}
		} finally {
			setIsNaturalLoading(false);
		}
	}

	useEffect(() => {
		const controller = new AbortController();
		fetchData(controller.signal);
		fetchNaturalData(controller.signal);

		return () => controller.abort();
	}, []);

	function handleRefresh() {
		fetchData();
		fetchNaturalData();
	}

	useEffect(() => {
		const timerId = window.setInterval(() => {
			setClock(new Date());
		}, 1000);

		return () => window.clearInterval(timerId);
	}, []);

	const features = useMemo(
		() => earthquakeData?.features ?? [],
		[earthquakeData],
	);

	const stats = useMemo(() => {
		if (features.length === 0) {
			return {
				total: 0,
				avgMagnitude: "0.00",
				strongest: null,
				tsunamiCount: 0,
				last24Hours: 0,
			};
		}

		const now = Date.now();
		let magnitudeSum = 0;
		let magnitudeCount = 0;
		let tsunamiCount = 0;
		let strongest = features[0];
		let last24Hours = 0;

		for (const feature of features) {
			const props = feature.properties ?? {};
			const mag = Number(props.mag);
			if (!Number.isNaN(mag)) {
				magnitudeSum += mag;
				magnitudeCount += 1;
				if ((strongest.properties?.mag ?? -10) < mag) {
					strongest = feature;
				}
			}

			if (props.tsunami === 1) {
				tsunamiCount += 1;
			}

			if (props.time && now - props.time <= 24 * 60 * 60 * 1000) {
				last24Hours += 1;
			}
		}

		return {
			total: features.length,
			avgMagnitude:
				magnitudeCount > 0
					? (magnitudeSum / magnitudeCount).toFixed(2)
					: "0.00",
			strongest,
			tsunamiCount,
			last24Hours,
		};
	}, [features]);

	function formatEvent(feature) {
		const props = feature.properties ?? {};
		const coords = feature.geometry?.coordinates ?? [];
		const magnitude = Number(props.mag);
		const depth = Number(coords[2]);

		return {
			title: `M${Number.isNaN(magnitude) ? "?" : magnitude.toFixed(1)} | ${props.place ?? "Unknown location"}`,
			details: `Depth ${Number.isNaN(depth) ? "?" : depth.toFixed(1)} km | ${new Date(props.time ?? Date.now()).toLocaleString()}`,
			meta: `Status: ${props.status ?? "unknown"} | Type: ${props.type ?? "earthquake"}`,
			flag: props.tsunami === 1 ? "Tsunami watch" : "No tsunami",
			link: props.url,
		};
	}

	const seismicFeed = useMemo(() => {
		return [...features]
			.sort(
				(a, b) =>
					(Number(b.properties?.mag) || 0) - (Number(a.properties?.mag) || 0),
			)
			.slice(0, 8)
			.map(formatEvent);
	}, [features]);

	const atmosphericFeed = useMemo(() => {
		const prioritized = features.filter(
			(feature) =>
				feature.properties?.tsunami === 1 || feature.properties?.alert,
		);

		return (prioritized.length > 0 ? prioritized : features)
			.slice(0, 8)
			.map(formatEvent);
	}, [features]);

	const orbitalFeed = useMemo(() => {
		return [...features]
			.sort((a, b) => (b.properties?.time || 0) - (a.properties?.time || 0))
			.slice(0, 8)
			.map(formatEvent);
	}, [features]);

	const earthquakeRows = useMemo(() => {
		const windowStart = Date.now() - 24 * 60 * 60 * 1000;
		const recent = features.filter(
			(feature) => (feature.properties?.time || 0) >= windowStart,
		);
		const base = recent.length > 0 ? recent : features;

		if (quakeSort === "newest") {
			return [...base]
				.sort((a, b) => (b.properties?.time || 0) - (a.properties?.time || 0))
				.slice(0, 8);
		}

		return [...base]
			.sort(
				(a, b) =>
					(Number(b.properties?.mag) || 0) - (Number(a.properties?.mag) || 0),
			)
			.slice(0, 8);
	}, [features, quakeSort]);

	const intelligenceFeed = useMemo(() => {
		const strongest = stats.strongest;
		const strongestMagnitude = Number(strongest?.properties?.mag);
		const strongestPlace = strongest?.properties?.place ?? "No events yet";

		return [
			{
				title: "Mission Snapshot",
				details: `Tracking ${stats.total} events in current window`,
				meta: `Average magnitude ${stats.avgMagnitude}`,
				flag: "Intelligence",
			},
			{
				title: "Strongest Event",
				details: `M${Number.isNaN(strongestMagnitude) ? "?" : strongestMagnitude.toFixed(1)} at ${strongestPlace}`,
				meta: strongest?.properties?.time
					? new Date(strongest.properties.time).toLocaleString()
					: "No timestamp",
				flag: "Seismic",
				link: strongest?.properties?.url,
			},
			{
				title: "Tsunami Signals",
				details: `${stats.tsunamiCount} flagged events`,
				meta: "Atmospheric watchlist priority",
				flag: "Atmospheric",
			},
			{
				title: "24h Activity",
				details: `${stats.last24Hours} events in the last 24 hours`,
				meta: "Orbital timeline synced",
				flag: "Orbital",
			},
		];
	}, [stats]);

	const sectionMap = {
		Intelligence: intelligenceFeed,
		Seismic: seismicFeed,
		Atmospheric: atmosphericFeed,
		Orbital: orbitalFeed,
		Archive: intelligenceFeed,
	};

	const visibleFeed = sectionMap[activeSection] ?? [];

	const sidebarSections = [
		{
			name: "Intelligence",
			icon: "analytics",
			short: "INTEL",
			count: intelligenceFeed.length,
		},
		{
			name: "Seismic",
			icon: "sensors",
			short: "SEISMIC",
			count: seismicFeed.length,
		},
		{
			name: "Atmospheric",
			icon: "cyclone",
			short: "ATMOS",
			count: atmosphericFeed.length,
		},
		{
			name: "Orbital",
			icon: "rocket_launch",
			short: "ORBITAL",
			count: orbitalFeed.length,
		},
		{ name: "Archive", icon: "database", short: "ARCHIVE", count: stats.total },
	];

	const techCards = useMemo(() => {
		const defaults = [
			{
				tag: "AI",
				source: "HN",
				headline: "Anthropic announces Claude 3.5 Sonnet",
				meta: "1420 pts | 342 comments | 4h ago",
			},
			{
				tag: "Engineering",
				source: "DEV",
				headline: "Why I'm rewriting my Rust API in Go",
				meta: "89 pts | 12 comments | 1h ago",
			},
			{
				tag: "Space",
				source: "HN",
				headline: "Heavy lift mission reaches geosynchronous transfer orbit",
				meta: "2105 pts | 841 comments | 6h ago",
			},
		];

		if (visibleFeed.length === 0) {
			return defaults;
		}

		return visibleFeed.slice(0, 6).map((item, index) => ({
			tag: item.flag,
			source: index % 2 === 0 ? "HN" : "DEV",
			headline: item.title,
			meta: item.details,
		}));
	}, [visibleFeed]);

	const filteredTechCards = useMemo(() => {
		if (!searchText.trim()) {
			return techCards;
		}

		const query = searchText.toLowerCase();
		return techCards.filter(
			(item) =>
				item.headline.toLowerCase().includes(query) ||
				item.tag.toLowerCase().includes(query) ||
				item.meta.toLowerCase().includes(query),
		);
	}, [techCards, searchText]);

	const naturalEventRows = useMemo(() => {
		return naturalEvents.slice(0, 8).map((event) => {
			const latest = event.geometry?.[event.geometry.length - 1];
			const category = event.categories?.[0]?.title || "Event";
			const location = event.geometry?.[0]?.coordinates
				? `${event.geometry[0].coordinates[1].toFixed(2)}, ${event.geometry[0].coordinates[0].toFixed(2)}`
				: "Global";

			return {
				id: event.id,
				title: event.title,
				category,
				location,
				time: latest?.date
					? new Date(latest.date).toLocaleString()
					: "Unknown time",
				link: event.sources?.[0]?.url,
			};
		});
	}, [naturalEvents]);

	const showNaturalWidget = isNaturalLoading || naturalEventRows.length > 0;

	const launchCards = [
		{
			agency: "SPACEX",
			mission: "Starlink Group 9-4",
			vehicle: "Falcon 9 Block 5",
			countdown: "T- 02:14:33:07",
			pad: "VAFB, SLC-4E",
		},
		{
			agency: "ROCKETLAB",
			mission: "Owl For One, One For Owl",
			vehicle: "Electron",
			countdown: "T- 05:08:12:45",
			pad: "Mahia, LC-1B",
		},
	];

	function magnitudeChipClasses(mag) {
		if (mag >= 6) {
			return "bg-red-500/20 text-red-300 border border-red-500/40";
		}
		if (mag >= 5) {
			return "bg-orange-500/20 text-orange-300 border border-orange-500/40";
		}
		if (mag >= 4) {
			return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40";
		}
		return "bg-[#00e639]/20 text-[#72ff70] border border-[#00e639]/40";
	}

	function sectionButtonClasses(sectionName, mobile = false) {
		const active = activeSection === sectionName;
		if (mobile) {
			return active
				? "text-[#72ff70] border-t-2 border-[#72ff70]"
				: "text-gray-400 border-t-2 border-transparent";
		}

		return active
			? "text-[#00e639] bg-[#31353c] border-l-4 border-[#00e639]"
			: "text-[#b9ccb2] hover:bg-[#262a31] hover:text-[#dfe2eb] border-l-4 border-transparent";
	}

	return (
		<div className="min-h-screen bg-[#10141a] text-[#dfe2eb] pb-16">
			<header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#181c22] border-b border-[#30363d] px-4 md:px-8 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<span className="material-symbols-outlined text-[#00e639]">
						satellite
					</span>
					<p className="text-2xl font-bold tracking-tight text-[#72ff70]">
						TERRAWIRE
					</p>
				</div>
				<div className="hidden md:block w-full max-w-xl mx-8 relative">
					<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
						search
					</span>
					<input
						type="text"
						value={searchText}
						onChange={(event) => setSearchText(event.target.value)}
						placeholder="Search global data streams..."
						className="w-full bg-[#090909] border border-[#30363d] rounded px-9 py-2 text-sm text-[#dfe2eb] placeholder:text-gray-500 focus:outline-none focus:border-[#00dce6]"
					/>
				</div>
				<div className="flex items-center gap-3 md:gap-4">
					<p className="text-xs md:text-sm text-gray-400 font-data">
						{lastUpdated
							? `last updated ${lastUpdated.toLocaleTimeString()}`
							: clock.toLocaleTimeString()}
					</p>
					<button
						type="button"
						onClick={handleRefresh}
						className="p-2 rounded hover:bg-[#31353c] transition"
					>
						<span
							className={`material-symbols-outlined ${isLoading ? "animate-spin" : ""}`}
						>
							refresh
						</span>
					</button>
				</div>
			</header>

			<nav className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 bg-[#10141a] border-r border-[#30363d] py-4 z-40 flex-col">
				<div className="px-6 mb-8">
					<p className="text-lg font-semibold text-[#72ff70]">
						MISSION CONTROL
					</p>
					<p className="text-xs text-gray-500">Global Event Monitor</p>
				</div>
				<ul className="px-4 space-y-1">
					{sidebarSections.map((section) => (
						<li key={section.name}>
							<button
								type="button"
								onClick={() => setActiveSection(section.name)}
								className={`w-full rounded-lg px-4 py-3 flex items-center justify-between transition ${sectionButtonClasses(section.name)}`}
							>
								<span className="flex items-center gap-3">
									<span className="material-symbols-outlined text-[18px]">
										{section.icon}
									</span>
									<span>{section.name}</span>
								</span>
								<span className="text-xs text-gray-400">{section.count}</span>
							</button>
						</li>
					))}
				</ul>
			</nav>

			<main className="pt-20 pb-20 lg:ml-64 px-4 md:px-8 flex flex-col xl:flex-row gap-4">
				<section className="xl:hidden mb-2">
					<div className="flex justify-between items-center mb-2">
						<p className="text-xs tracking-[0.08em] text-[#b9ccb2]">
							GLOBAL SENSORS
						</p>
						<div className="flex gap-1">
							<span className="w-2 h-2 rounded-full bg-[#72ff70]"></span>
							<span className="w-2 h-2 rounded-full bg-[#31353c]"></span>
							<span className="w-2 h-2 rounded-full bg-[#31353c]"></span>
						</div>
					</div>
					<div className="flex overflow-x-auto gap-2 pb-2 snap-x snap-mandatory">
						<div className="snap-start min-w-64 bg-[#161b22] border border-[#30363d] rounded p-3">
							<div className="flex justify-between items-center mb-2">
								<p className="text-xs text-[#72ff70]">SEISMIC</p>
								<p className="text-xs text-red-300">
									{stats.strongest?.properties?.mag?.toFixed?.(1) ?? "0.0"}
								</p>
							</div>
							<p className="text-sm font-semibold truncate">
								{stats.strongest?.properties?.place ?? "No seismic events"}
							</p>
							<p className="text-xs text-gray-400 mt-1">
								{stats.last24Hours} in last 24h
							</p>
						</div>
						<div className="snap-start min-w-64 bg-[#161b22] border border-red-500/40 rounded p-3">
							<div className="flex justify-between items-center mb-2 text-red-300">
								<p className="text-xs">ORBITAL</p>
								<span className="material-symbols-outlined text-sm">
									warning
								</span>
							</div>
							<p className="text-sm font-semibold">Telemetry Lost</p>
							<p className="text-xs text-gray-400 mt-1">SAT-V42 OFFLINE</p>
						</div>
						<div className="snap-start min-w-64 bg-[#161b22] border border-[#30363d] rounded p-3">
							<div className="flex justify-between items-center mb-2">
								<p className="text-xs text-[#00dce6]">ATMOSPHERIC</p>
								<p className="text-xs text-[#00dce6]">CAT 4</p>
							</div>
							<p className="text-sm font-semibold">Typhoon Yagi</p>
							<p className="text-xs text-gray-400 mt-1">
								Wind: 130kt | Eye: 25nm
							</p>
						</div>
					</div>
				</section>

				<section className="xl:w-[62%] flex flex-col gap-4">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="text-xl font-semibold text-[#dfe2eb]">Tech Signals</p>
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								className="px-3 py-1 rounded-full bg-[#00e639]/20 text-[#72ff70] border border-[#00e639]/50 text-xs"
							>
								All
							</button>
							<button
								type="button"
								className="px-3 py-1 rounded-full bg-[#31353c] border border-[#30363d] text-[#b9ccb2] text-xs"
							>
								AI
							</button>
							<button
								type="button"
								className="px-3 py-1 rounded-full bg-[#31353c] border border-[#30363d] text-[#b9ccb2] text-xs"
							>
								JavaScript
							</button>
							<button
								type="button"
								className="px-3 py-1 rounded-full bg-[#31353c] border border-[#30363d] text-[#b9ccb2] text-xs"
							>
								C++
							</button>
							<button
								type="button"
								className="px-3 py-1 rounded-full bg-[#31353c] border border-[#30363d] text-[#b9ccb2] text-xs"
							>
								Space
							</button>
						</div>
					</div>

					{errorMessage ? (
						<p className="text-sm text-red-300">{errorMessage}</p>
					) : null}
					{isLoading ? (
						<p className="text-sm text-gray-400">Loading live events...</p>
					) : null}

					<div className="flex flex-col gap-3">
						{filteredTechCards.map((card, index) => (
							<article
								key={`${card.headline}-${index}`}
								className="bg-[#161b22] border border-[#30363d] p-4 rounded-xl hover:border-[#00dce6]/50 transition-colors"
							>
								<div className="flex items-start gap-4">
									<div className="w-8 h-8 rounded-md border border-white/20 bg-white/10 flex items-center justify-center text-[10px] text-gray-200">
										{card.source}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-base font-semibold mb-1 truncate">
											{card.headline}
										</p>
										<p className="text-xs text-gray-400">{card.meta}</p>
									</div>
									<span className="hidden sm:inline text-[10px] px-2 py-1 rounded bg-[#31353c] text-[#b9ccb2]">
										{card.tag}
									</span>
								</div>
							</article>
						))}
					</div>
				</section>

				<section className="xl:w-[38%] flex flex-col gap-6">
					<div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
						<div className="px-4 py-3 border-b border-[#30363d] flex justify-between items-center bg-[#181c22]">
							<p className="text-xs tracking-[0.08em] text-[#dfe2eb] flex items-center gap-2">
								<span className="material-symbols-outlined text-sm text-[#00e639]">
									sensors
								</span>
								EARTHQUAKES - LAST 24H
							</p>
							<select
								value={quakeSort}
								onChange={(event) => setQuakeSort(event.target.value)}
								className="bg-[#090909] border border-[#30363d] rounded text-xs text-gray-400 px-2 py-1"
							>
								<option value="magnitude">Sort: Magnitude</option>
								<option value="newest">Sort: Newest</option>
							</select>
						</div>
						<div className="p-2 max-h-64 overflow-y-auto space-y-1">
							{earthquakeRows.map((feature, index) => {
								const mag = Number(feature.properties?.mag) || 0;
								const depth = Number(feature.geometry?.coordinates?.[2]);
								return (
									<div
										key={`${feature.id || index}`}
										className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#31353c]/50 transition-colors"
									>
										<span
											className={`w-12 text-center px-2 py-1 rounded text-xs font-bold ${magnitudeChipClasses(mag)}`}
										>
											{mag.toFixed(1)}
										</span>
										<div className="flex-1 min-w-0">
											<p className="text-sm truncate">
												{feature.properties?.place ?? "Unknown location"}
											</p>
											<p className="text-xs text-gray-500">
												Depth {Number.isNaN(depth) ? "?" : depth.toFixed(0)}km |{" "}
												{new Date(
													feature.properties?.time || Date.now(),
												).toLocaleTimeString()}
											</p>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{showNaturalWidget ? (
						<div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
							<div className="px-4 py-3 border-b border-[#30363d] bg-[#181c22] flex items-center justify-between">
								<p className="text-xs tracking-[0.08em] flex items-center gap-2">
									<span className="material-symbols-outlined text-sm text-[#00dce6]">
										public
									</span>
									NATURAL EVENTS
								</p>
								{isNaturalLoading ? (
									<span className="text-xs text-gray-500">syncing...</span>
								) : null}
							</div>
							<div className="p-2 space-y-1">
								{naturalEventRows.map((event) => (
									<div
										key={event.id}
										className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#31353c]/50 transition-colors"
									>
										<span className="material-symbols-outlined text-orange-400 text-lg">
											public
										</span>
										<div className="min-w-0 flex-1">
											<p className="text-sm truncate">{event.title}</p>
											<p className="text-xs text-gray-500 truncate">
												{event.category} | {event.location}
											</p>
											<p className="text-xs text-gray-500 truncate">
												{event.time}
											</p>
											{event.link ? (
												<a
													href={event.link}
													target="_blank"
													rel="noreferrer"
													className="text-xs text-blue-300 underline"
												>
													open source event
												</a>
											) : null}
										</div>
									</div>
								))}
								{isNaturalLoading && naturalEventRows.length === 0 ? (
									<p className="text-xs text-gray-500 p-2">
										Loading natural events...
									</p>
								) : null}
							</div>
						</div>
					) : null}

					<div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
						<div className="px-4 py-3 border-b border-[#30363d] bg-[#181c22]">
							<p className="text-xs tracking-[0.08em] flex items-center gap-2">
								<span className="material-symbols-outlined text-sm text-[#00e639]">
									rocket_launch
								</span>
								NEXT LAUNCHES
							</p>
						</div>
						<div className="p-4 space-y-4">
							{launchCards.map((launch) => (
								<div
									key={launch.mission}
									className="flex items-center justify-between border-b border-[#30363d] pb-3 last:border-0 last:pb-0"
								>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded bg-[#090909] border border-[#30363d] flex items-center justify-center text-[10px] text-gray-500 px-1 text-center">
											{launch.agency}
										</div>
										<div>
											<p className="text-sm">{launch.mission}</p>
											<p className="text-xs text-gray-500">{launch.vehicle}</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-sm text-[#00e639] font-data">
											{launch.countdown}
										</p>
										<p className="text-[10px] text-gray-500 mt-1">
											{launch.pad}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>
			</main>

			<footer className="hidden md:flex w-full py-1 px-8 bg-[#0a0e14] border-t border-[#30363d] justify-between items-center text-xs text-[#00dce6]">
				<p className="text-[#b9ccb2]">(c) 2024 TERRAWIRE SIGNAL COMMAND</p>
				<div className="flex gap-4 text-gray-400">
					<a
						href="#"
						className="hover:text-[#dfe2eb]"
					>
						System Status
					</a>
					<a
						href="#"
						className="hover:text-[#dfe2eb]"
					>
						API Docs
					</a>
					<a
						href="#"
						className="hover:text-[#dfe2eb]"
					>
						Protocol
					</a>
					<a
						href="#"
						className="hover:text-[#dfe2eb]"
					>
						Contact
					</a>
				</div>
			</footer>

			<nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#10141a] border-t border-[#30363d] flex md:hidden z-50">
				{sidebarSections.slice(0, 4).map((section) => (
					<button
						key={section.name}
						type="button"
						onClick={() => setActiveSection(section.name)}
						className={`flex-1 flex flex-col items-center justify-center ${sectionButtonClasses(section.name, true)}`}
					>
						<span className="material-symbols-outlined text-[18px]">
							{section.icon}
						</span>
						<span className="text-[10px] mt-1">{section.short}</span>
					</button>
				))}
			</nav>
		</div>
	);
}
