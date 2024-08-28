const { Telegraf } = require("telegraf");
const { generateDocx, sendDocxToTelegram } = require("./generate");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const http = require("http");

const bot = new Telegraf("7233919153:AAHzmqblsqk4jdLPcdLQdezRKA-vPY1SUDE");
const chatId = "-4254781522";
const server = http.createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "text/html" });
	res.end("<h1>Hello World</h1>");
});

server.listen(8080);

bot.on("message", (ctx) => {
	if (ctx.message.document) {
		ctx.telegram.getFile(ctx.message.document.file_id).then((file) => {
			const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
			axios
				.get(fileUrl, { responseType: "arraybuffer" })
				.then((response) => {
					// Save the file to a temporary location
					fs.writeFileSync(
						path.join(__dirname, "/data", "values.xlsx"),
						response.data
					);

					// Process the file only after it's been received and saved
					generateDocx();
					sendDocxToTelegram(ctx, chatId);
				})
				.catch((error) => {
					console.error(error);
				});
		});
	}
});

bot.launch();
