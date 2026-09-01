const API_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query";

export function buildEarthquakeQuery(params = {}) {
	const defaultParams = {
		format: "geojson",
		starttime: "2024-01-01",
		endtime: new Date().toISOString().slice(0, 10),
		limit: "50",
		...params,
	};

	const query = new URLSearchParams(defaultParams);
	return `${API_URL}?${query.toString()}`;
}

export async function fetchEarthquakeData(params = {}, options = {}) {
	const response = await fetch(buildEarthquakeQuery(params), options);

	if (!response.ok) {
		throw new Error(`USGS request failed with status ${response.status}`);
	}

	return response.json();
}
