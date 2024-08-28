const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const fs = require("fs");
const { NewMessage } = require("telegram/events");
const path = require("path");
const { transformedData, templateContent } = require("./generate");
const http = require("http");
const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");
const { CustomFile } = require("telegram/client/uploads");

const apiId = 22701361;
const apiHash = "5d579e2ca05ea7fd05292554eeabdde0";
const sessionFile = "session.txt";

const server = http.createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "text/html" });
	res.end("<h1>Hello World</h1>");
});

server.listen(3000).on("listening", () => {
	console.log("Server is listening on port 3000");
});

const loadSession = () => {
	if (fs.existsSync(sessionFile)) {
		return fs.readFileSync(sessionFile, "utf8");
	}
	return "";
};

const saveSession = (session) => {
	fs.writeFileSync(sessionFile, session, "utf8");
};

const stringSession = new StringSession(loadSession());

(async () => {
	console.log("Loading interactive example...");
	const client = new TelegramClient(stringSession, apiId, apiHash, {
		connectionRetries: 5,
	});
	await client.start({
		phoneNumber: async () => await input.text("Please enter your number: "),
		password: async () => await input.text("Please enter your password: "),
		phoneCode: async () =>
			await input.text("Please enter the code you received: "),
		onError: (err) => console.log(err),
	});

	console.log("You are now connected.");

	// Save session
	saveSession(client.session.save());

	await client.addEventHandler(async (event) => {
		const message = event.message;
		const sender = await message.getSender();

		// Replace with the logic to check if the sender is the marked number
		if (sender.phone == "998995160450" || sender.phone == "998908324608") {
			const media = message.media;
			if (media && media.document) {
				const fileId = media.document.id;
				const filePath = await client
					.downloadMedia(media, {
						workers: 1,
						outputFile: `./data/values.xlsx`,
					})
					.then(async () => {
						transformedData.forEach(async (item) => {
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
							const fileName = `${item.court}_${item.name}.docx`;

							if (!fileName.includes("undefined")) {
								const buffer = Buffer.from(buf); // replace with your buffer
								const file = new CustomFile(
									fileName,
									buffer.length,
									"",
									buffer
								);
								const uploadedFile = await client.uploadFile({
									file,
									workers: 1000,
								});
								await client.sendFile(sender.id, {
									file: uploadedFile,
									caption: uploadedFile.name,
								});
							}
						});
					});
			}
		}
	}, new NewMessage({}));

	// Keeping the program running
	setInterval(() => {}, 1000);

	// await client.disconnect();
})();
