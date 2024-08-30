const DATE_CONVERT_PATTERN = /^(\d+)\/(\d+)\/(\d+)$/;

function extractName(input) {
	const regex = /(.*) (.*) (.*) (.*?)йилда туғилган (.*)/;
	const match = input.match(regex);

	if (match) {
		const [_, lastName, firstName, middleName, borndate, address] = match;
		const result = {
			name: `${lastName} ${firstName} ${middleName}`,
			borndate,
			address,
		};
		return result;
	}
}

function extractSubstance(input) {
	// Use regular expression to match one or more digits
	const regex = /\d+/g;
	const match = input.match(regex);
	if (match) {
		// Use String.match() to find all matches
		// Join the matches with a comma and return the result
		return match.join(",");
	}
}

function extractCourt(input) {
	const regex = /(.*?)суди\s*(\d+)\s*сутка/;
	const match = input.match(regex);
	if (match) {
		const court = match[1] + " суди"; // don't trim суди
		const period = parseInt(match[2], 10);
		const result = {
			court,
			period,
		};
		console.log(result);

		return result;
	}
}

function convertDate(input) {
	const match = input.match(DATE_CONVERT_PATTERN);

	if (match) {
		const result = `${match[2]}.${match[1]}.${match[3]}`;
		return result;
	}
}

module.exports = {
	extractName,
	extractSubstance,
	extractCourt,
	convertDate,
};
