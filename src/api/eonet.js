const EONET_API_URL = "https://eonet.gsfc.nasa.gov/api/v3/events";

export function buildEonetQuery(params = {}) {
	const defaults = {
		status: "open",
		limit: "20",
		...params,
	};

	const query = new URLSearchParams(defaults);
	return `${EONET_API_URL}?${query.toString()}`;
}

export async function fetchOpenNaturalEvents(params = {}, options = {}) {
	const response = await fetch(buildEonetQuery(params), options);

	if (!response.ok) {
		throw new Error(`EONET request failed with status ${response.status}`);
	}

	return response.json();
}
