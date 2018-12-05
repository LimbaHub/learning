"use strict";

const Koa = require("koa");
const http = require("http");
const fs = require("fs");
const app = new Koa();

let server = http.createServer(app.callback());

const io = require("socket.io")(server, {});

io.on("connection", function(socket) {
	socket.on("message", message => {
		console.log(message.type);
		console.log(JSON.stringify(message));
		socket.broadcast.emit("message", message);
	});
});

var staticServer = require("koa-static");
var path = require("path");
app.use(staticServer(path.join(__dirname, "public")));

const main = ctx => {
	ctx.response.type = "html";
	ctx.response.body = fs.createReadStream("./index.html");
};
app.use(main);

server.listen(666);
