const xlsx = require("xlsx");
const moment = require("moment");
const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");
const {
	convertDate,
	extractCourt,
	extractName,
	extractSubstance,
} = require("./convert");

// Load the Excel file
const workbook = xlsx.readFile(path.join(__dirname, "/data/values.xlsx"));
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Convert the sheet to JSON data
const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// Define headers for the data
const headers = [
	"id",
	"nameAndDate",
	"substance",
	"courtAndPeriod",
	"date",
	"amount",
	"decisionNumber",
];

// Process and transform the data
const data = jsonData.map((row) => {
	const processedRow = headers.reduce((obj, header, i) => {
		let value = row[i];
		// Convert Excel date format to readable date format if necessary
		if (typeof value === "number" && value > 40000 && header === "date") {
			value = moment(new Date((value - 25569) * 86400 * 1000)).format(
				"MM/DD/YYYY"
			);
		}
		obj[header] = getCellValue(value, header);
		return obj;
	}, {});
	return processedRow;
});

// Function to get cell value based on header type
function getCellValue(value, header) {
	if (value === undefined) return "";
	switch (header) {
		case "nameAndDate":
			return extractName(value);
		case "substance":
			return extractSubstance(value);
		case "courtAndPeriod":
			return extractCourt(value);
		case "date":
			return convertDate(value);
		default:
			return value;
	}
}

// Transform the processed data for document generation
const transformedData = data.map((item) => ({
	...item.nameAndDate,
	substance: item.substance,
	...item.courtAndPeriod,
	date: item.date,
	amount: item.amount,
	decisionNumber: item.decisionNumber,
}));

// Load the docx template file
const templatePath = path.join(__dirname, "/data/file.docx");
const templateContent = fs.readFileSync(templatePath, "binary");

// Function to generate DOCX files from the transformed data
function generateDocx() {
	transformedData.forEach((item) => {
		const zip = new PizZip(templateContent);
		const doc = new Docxtemplater(zip, {
			paragraphLoop: true,
			linebreaks: true,
		});

		// Set the data to replace placeholders in the template
		doc.setData({
			name: item.name,
			borndate: item.borndate,
			address: item.address,
			substance: item.substance,
			court: item.court,
			period: item.period,
			date: item.date,
			amount: item.amount,
			decisionNumber: item.decisionNumber,
		});

		// Render the document with the actual data
		doc.render();

		// Generate the document buffer and save it to a new file
		const buf = doc.getZip().generate({ type: "nodebuffer" });
		const filename = `${item.court}_${item.name}.docx`;
		fs.writeFileSync(path.join(__dirname, "/generated/", filename), buf);
	});
	console.log("Generated DOCX files");
}

// async function sendDocxToTelegram(ctx, chatId) {
// 	const generatedFilesDir = path.join(__dirname, "/generated/");
// 	const files = fs.readdirSync(generatedFilesDir);

// 	for (const file of files) {
// 		const filePath = path.join(generatedFilesDir, file);
// 		const fileBuffer = fs.readFileSync(filePath);

// 		await ctx.telegram.sendDocument(chatId, {
// 			source: fileBuffer,
// 			filename: file,
// 			contentType:
// 				"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
// 		});
// 		// .then(() => {
// 		// 	fs.unlinkSync(filePath);
// 		// });
// 	}

// 	await ctx.telegram.sendMessage(
// 		ctx.message.chat.id,
// 		"Fayllar guruhga yuborildi!"
// 	);
// }

module.exports = {
	generateDocx,
	transformedData,
	templateContent,
};
