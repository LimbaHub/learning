"use strict";

const Koa = require("koa");
const http = require("http");
const fs = require("fs");
const app = new Koa();

let server = http.createServer(app.callback());

const io = require("socket.io")(server, {});

io.on("connection", function(socket) {
	socket.on("message", (message, targetId, sourceId) => {
		socket.broadcast.emit("message", message, targetId, sourceId);
	});
	//向所有用户转发offer
	socket.on("offer", (offer, targetId, sourceId) => {
		console.log(sourceId + ": give offer to " + targetId);
		io.sockets.sockets[targetId].emit("message", offer, sourceId);
	});
	//向offer发起者转发answer
	socket.on("answer", (answer, targetId, sourceId) => {
		console.log(sourceId + ": answer " + targetId);
		io.sockets.sockets[targetId].emit("message", answer, sourceId);
	});
	socket.on("create or join", roomName => {
		let room = io.sockets.adapter.rooms[roomName];

		let clientNum = room ? Object.keys(room.sockets).length : 0;
		if (clientNum === 0) {
			socket.join(roomName);
			socket.emit("create success", socket.id);
			console.log(socket.id + " create room");
		} else {
			let clientIds = Object.keys(room.sockets);
			socket.join(roomName);
			socket.emit("join success", clientIds, socket.id);
			console.log(socket.id + " join room");
		}
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

// var a = {
// 	nsp: {
// 		name: "/",
// 		server: {
// 			nsps: "Object",
// 			parentNsps: {},
// 			_path: "/socket.io",
// 			_serveClient: true,
// 			parser: "Object",
// 			encoder: {},
// 			_adapter: "Function",
// 			_origins: "*:*",
// 			sockets: "Circular",
// 			eio: "Object",
// 			httpServer: "Object",
// 			engine: "Object"
// 		},
// 		sockets: {
// 			"6ebyODFUH62dts-XAAAA": "Circular",
// 			"mOy2zQWynH0C-5iZAAAB": "Object"
// 		},
// 		connected: {
// 			"6ebyODFUH62dts-XAAAA": "Circular",
// 			"mOy2zQWynH0C-5iZAAAB": "Object"
// 		},
// 		fns: [],
// 		ids: 0,
// 		rooms: [],
// 		flags: {},
// 		adapter: {
// 			nsp: "Circular",
// 			rooms: "Object",
// 			sids: "Object",
// 			encoder: {}
// 		},
// 		_events: { connection: [Function] },
// 		_eventsCount: 1
// 	},
// 	server: {
// 		nsps: { "/": "Object" },
// 		parentNsps: {},
// 		_path: "/socket.io",
// 		_serveClient: true,
// 		parser: {
// 			protocol: 4,
// 			types: [Array],
// 			CONNECT: 0,
// 			DISCONNECT: 1,
// 			EVENT: 2,
// 			ACK: 3,
// 			ERROR: 4,
// 			BINARY_EVENT: 5,
// 			BINARY_ACK: 6,
// 			Encoder: "Function: Encoder",
// 			Decoder: "Function: Decoder"
// 		},
// 		encoder: {},
// 		_adapter: "Function",
// 		_origins: "*:*",
// 		sockets: {
// 			name: "/",
// 			server: "Circular",
// 			sockets: "Object",
// 			connected: "Object",
// 			fns: [],
// 			ids: 0,
// 			rooms: [],
// 			flags: {},
// 			adapter: "Object",
// 			_events: "Object",
// 			_eventsCount: 1
// 		},
// 		eio: {
// 			clients: "Object",
// 			clientsCount: 2,
// 			wsEngine: "ws",
// 			pingTimeout: 5000,
// 			pingInterval: 25000,
// 			upgradeTimeout: 10000,
// 			maxHttpBufferSize: 100000000,
// 			transports: [Array],
// 			allowUpgrades: true,
// 			allowRequest: "Function: bound ",
// 			cookie: "io",
// 			cookiePath: "/",
// 			cookieHttpOnly: true,
// 			perMessageDeflate: "Object",
// 			httpCompression: "Object",
// 			initialPacket: [Array],
// 			ws: "Object",
// 			_events: "Object",
// 			_eventsCount: 1
// 		},
// 		httpServer: {
// 			domain: null,
// 			_events: "Object",
// 			_eventsCount: 5,
// 			_maxListeners: undefined,
// 			_connections: 2,
// 			_handle: "Object",
// 			_usingSlaves: false,
// 			_slaves: [],
// 			_unref: false,
// 			allowHalfOpen: true,
// 			pauseOnConnect: false,
// 			httpAllowHalfOpen: false,
// 			timeout: 120000,
// 			keepAliveTimeout: 5000,
// 			_pendingResponseData: 0,
// 			maxHeadersCount: null,
// 			_connectionKey: "6::::666",
// 			[Symbol(asyncId)]: 6
// 		},
// 		engine: {
// 			clients: "Object",
// 			clientsCount: 2,
// 			wsEngine: "ws",
// 			pingTimeout: 5000,
// 			pingInterval: 25000,
// 			upgradeTimeout: 10000,
// 			maxHttpBufferSize: 100000000,
// 			transports: [Array],
// 			allowUpgrades: true,
// 			allowRequest: "Function: bound ",
// 			cookie: "io",
// 			cookiePath: "/",
// 			cookieHttpOnly: true,
// 			perMessageDeflate: "Object",
// 			httpCompression: "Object",
// 			initialPacket: [Array],
// 			ws: "Object",
// 			_events: "Object",
// 			_eventsCount: 1
// 		}
// 	},
// 	adapter: {
// 		nsp: {
// 			name: "/",
// 			server: "Object",
// 			sockets: "Object",
// 			connected: "Object",
// 			fns: [],
// 			ids: 0,
// 			rooms: [],
// 			flags: {},
// 			adapter: "Circular",
// 			_events: "Object",
// 			_eventsCount: 1
// 		},
// 		rooms: {
// 			"6ebyODFUH62dts-XAAAA": "Object",
// 			"mOy2zQWynH0C-5iZAAAB": "Object",
// 			zoom: "Object"
// 		},
// 		sids: {
// 			"6ebyODFUH62dts-XAAAA": "Object",
// 			"mOy2zQWynH0C-5iZAAAB": "Object"
// 		},
// 		encoder: {}
// 	},
// 	id: "6ebyODFUH62dts-XAAAA",
// 	client: {
// 		server: {
// 			nsps: "Object",
// 			parentNsps: {},
// 			_path: "/socket.io",
// 			_serveClient: true,
// 			parser: "Object",
// 			encoder: {},
// 			_adapter: "Function",
// 			_origins: "*:*",
// 			sockets: "Object",
// 			eio: "Object",
// 			httpServer: "Object",
// 			engine: "Object"
// 		},
// 		conn: {
// 			id: "6ebyODFUH62dts-XAAAA",
// 			server: "Object",
// 			upgrading: false,
// 			upgraded: true,
// 			readyState: "open",
// 			writeBuffer: [],
// 			packetsFn: [],
// 			sentCallbackFn: [],
// 			cleanupFn: [Array],
// 			request: "Object",
// 			remoteAddress: "::1",
// 			checkIntervalTimer: null,
// 			upgradeTimeoutTimer: null,
// 			pingTimeoutTimer: "Object",
// 			transport: "Object",
// 			_events: "Object",
// 			_eventsCount: 3
// 		},
// 		encoder: {},
// 		decoder: { reconstructor: null, _callbacks: "Object" },
// 		id: "6ebyODFUH62dts-XAAAA",
// 		request: {
// 			_readableState: "Object",
// 			readable: false,
// 			domain: null,
// 			_events: {},
// 			_eventsCount: 0,
// 			_maxListeners: undefined,
// 			socket: "Object",
// 			connection: "Object",
// 			httpVersionMajor: 1,
// 			httpVersionMinor: 1,
// 			httpVersion: "1.1",
// 			complete: true,
// 			headers: "Object",
// 			rawHeaders: [Array],
// 			trailers: {},
// 			rawTrailers: [],
// 			upgrade: false,
// 			url: "/socket.io/?EIO=3&transport=polling&t=MReYxFB",
// 			method: "GET",
// 			statusCode: null,
// 			statusMessage: null,
// 			client: "Object",
// 			_consuming: true,
// 			_dumped: true,
// 			_query: "Object",
// 			res: "Object",
// 			cleanup: "Function: cleanup",
// 			read: [Function]
// 		},
// 		onclose: "Function: bound ",
// 		ondata: "Function: bound ",
// 		onerror: "Function: bound ",
// 		ondecoded: "Function: bound ",
// 		sockets: { "6ebyODFUH62dts-XAAAA": "Circular" },
// 		nsps: { "/": "Circular" },
// 		connectBuffer: []
// 	}
// };
