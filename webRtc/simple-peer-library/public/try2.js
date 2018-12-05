let textareaEle = document.getElementById("js-textarea"),
	createBtn = document.getElementById("js-create-btn");

class Member {
	constructor(clientIds, selfId) {
		//单例模式
		if (Member.instance) return Member.instance;
		this.peerMap = new Map();
		this.clientIds = clientIds || [];
		this.selfId = selfId;
		Member.instance = this;
	}
	//initiator代表是否要主动触发singal
	connectToAllClients(initiator) {
		this.clientIds.forEach(clientId => {
			this.connectToClient(clientId, initiator);
		});
	}

	connectToClient(clientId, initiator) {
		let peer = new SimplePeer({
			initiator,
			trickle: false,
			config: {}
		});

		peer.on("error", err => {
			console.log("error", err);
		});

		peer.on("signal", data => {
			if (initiator) {
				//一个peer好像只能单独给另外一个peer发offer
				console.log("Give offer");
				socket.emit(
					"offer",
					JSON.stringify(data),
					clientId,
					this.selfId
				);
			} else {
				console.log("Give answer");
				socket.emit(
					"answer",
					JSON.stringify(data),
					clientId,
					this.selfId
				);
			}
		});

		peer.on("connect", () => {
			console.log("CONNECT");
			peer.send("Hello RTC");
		});

		peer.on("data", data => {
			console.log("data: " + data);
			textareaEle.value += data;
		});
		this.peerMap.set(clientId, peer);
		if (this.clientIds.indexOf(clientId) == -1)
			this.clientIds.push(clientId);
		return peer;
	}

	boardcast(msg) {
		this.peerMap.forEach(peer => {
			peer.send(msg);
		});
	}

	receiveOffer(offer, clientId) {
		let peer = this.connectToClient(clientId, false);
		peer.signal(offer);
	}

	getAnswerFrom(clientId, answer) {
		let peer = this.peerMap.get(clientId);
		peer.signal(answer);
	}
}

Member.getInstance = function() {
	return this.instance;
};

textareaEle.onkeydown = e => {
	let member = Member.getInstance();
	if (!member) return;
	member.boardcast(e.key);
};

let roomName = "zoom";
createBtn.onclick = () => {
	socket.emit("create or join", roomName);
};

var socket = io.connect();

socket.on("message", (message, clientId) => {
	let member = Member.getInstance();
	if (!member) return;
	message = JSON.parse(message);
	switch (message.type) {
		case "offer": {
			console.log("Get Offer:");
			console.log(message);
			member.receiveOffer(message, clientId);
			break;
		}
		case "answer": {
			console.log("Get Answer:");
			member.getAnswerFrom(clientId, message);
			break;
		}
	}
});
//当创建房间成功的时候，实例化member
socket.on("create success", selfId => {
	if (!Member.getInstance()) new Member(undefined, selfId);
});
//当加入房间成功的时候，建立对所有其他房间成员的连接，并主动发offer
socket.on("join success", (clientIds, selfId) => {
	console.log(clientIds);
	console.log(selfId);
	let member = Member.instance
		? Member.instance
		: new Member(clientIds, selfId);
	member.connectToAllClients(true);
});
