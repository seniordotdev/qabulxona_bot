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
	const regex = /[МЖтК]+(\d+)/;
	const match = input.match(regex);
	if (match) {
		const number = match[1];
		return parseInt(number, 10);
	}
}

function extractCourt(input) {
	const regex = /(.*?)суди(\d+) сутка/;
	const match = input.match(regex);
	if (match) {
		const court = match[1] + "суди";
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
