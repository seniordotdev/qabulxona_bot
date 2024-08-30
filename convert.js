const DATE_CONVERT_PATTERN = /^(\d+)\/(\d+)\/(\d+)$/;

function extractName(str) {
	// Regular expression to match the name (all words up to a number)
	const nameRegex = /^[^\d]+/;
	const name = str.match(nameRegex)[0].trim();

	// Regular expression to match the birthdate (numbers)
	const birthdateRegex = /\d{2}\.\d{2}\.\d{4}/;
	const birthdate = str.match(birthdateRegex)[0];

	// The rest of the string is the address
	const address = str
		.replace(nameRegex, "")
		.replace(birthdateRegex, "")
		.replace("йилда туғилган", "")
		.trim();

	return {
		name,
		borndate: birthdate,
		address,
	};
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
