/**
 * This would never work without the work of these people creating this handy db
 * @const
 */
const CONFIRMED_REPORTS_URL = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv";

class IncidentEntry {
	/**
	 * @param {string} state
	 * @param {string} country
	 * @param {number} latitude
	 * @param {number} longitude
	 * @param {...number} progression 
	 */
	constructor(state, country, latitude, longitude, ...progression) {
		this.state = state;
		this.country = country;
		this.latitude = latitude;
		this.longitude = longitude;

		this.progression = progression;
	}

	/**
	 * Implements the https://en.wikipedia.org/wiki/Haversine_formula
	 * @param {number} latitude
	 * @param {number} longitude
	 * @return {number}
	 */
	distanceFrom(latitude, longitude) {
		/**
		 * @param {number} degrees Angle in degrees
		 * @return {number} Angle in radians.
		 */
		const toRadians = (degrees) => degrees * Math.PI / 180;

		const sinSq = (theta) => Math.sin(theta) * Math.sin(theta);
		const cosSq = (theta) => Math.cos(theta) * Math.cos(theta);

		const deltaLat = toRadians(this.latitude - latitude);
		const deltaLong = toRadians(this.longitude - longitude);

 		const a = sinSq(deltaLat/2) + 
 			Math.cos(toRadians(this.latitude)) *
 			Math.cos(toRadians(latitude)) *
 			sinSq(deltaLong/2);

 		const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

 		// earth's radius, km
 		const R = 3958.8; // close enough ¯\_(ツ)_/¯

 		return R*c;
	}

	getCurrentReports() {
		return parseInt(this.progression[this.progression.length - 1], 10);
	}

	getLocationName() {
		let result = '';

		if (this.state == '') {
			return this.country;
		} else {
			return this.state + " (" + this.country + ")";
		}
	}
}

function getIncidents(resolve, reject) {
	fetch(CONFIRMED_REPORTS_URL).then(x=>x.text()).then((csv) => {
		let entries = parseEntries(csv);

		resolve(entries);
	}).catch((e) => {
		alert("Failed to load COVID-19 incident reports. Perhaps try checking your internet connection?");
		console.error(e);
		reject();
	});
}

/**
 * @param {string} csv
 * @return {Array<IncidentEntry>}
 */
function parseEntries(csv) {
	/** @type {Array<IncidentEntry>} */
	let entries = [];

	let lines = csv.split('\n');
	lines.shift(); // remove first line
	for (let i = 0; i < lines.length; ++i) {
		const line = lines[i];

		let inQuotes = false;
		let str = '';

		let arr = [];
		for (let charIdx = 0; charIdx < line.length; ++charIdx) {
			let char = line.charAt(charIdx);
			if (char == '"') {
				inQuotes = !inQuotes;
			} else if (char == ',' && !inQuotes) {
				arr.push(str);
				str = '';
			} else {
				str += char;
			}
		}

		arr.push(str);
		entries.push(new IncidentEntry(...arr));
	}

	return entries;
}

function calculate() {
	new Promise(getIncidents).then((entries) => {
		const lat = document.getElementById("latitude").value;
		const long = document.getElementById("longitude").value;

		entries.sort((entryA, entryB) => {
			return entryA.distanceFrom(lat, long) - entryB.distanceFrom(lat, long);
		});

		const count = entries.reduce((acc, entry) => acc + entry.getCurrentReports(), 0);

		const nearestEntry = entries.find((entry) => entry.getCurrentReports() != 0);

		document.getElementById("results").classList.add("visible");
		document.getElementById("locationName").innerText = nearestEntry.getLocationName();
		document.getElementById("reports").innerText = nearestEntry.getCurrentReports();
		document.getElementById("count").innerText = count;
	});
}

window["calculate"] = calculate;