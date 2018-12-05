let pc,
	textareaEle = document.getElementById("js-textarea"),
	startBtn = document.getElementById("js-start-btn"),
	started = false,
	getRemote = false,
	timer;

// let iceServer = {
// 	iceServers: [
// 		{
// 			url: "stun:stun.l.google.com:19302"
// 		}
// 	]
// };

startBtn.onclick = doCall;

var socket = io.connect();

socket.on("message", message => {
	switch (message.type) {
		case "offer": {
			console.log("get offer");
			console.log("set remote description");
			pc.setRemoteDescription(new RTCSessionDescription(message));
			getRemote = true;
			initDataChannel();
			pc.createAnswer().then(message => {
				console.log("set local descriptino in answer");
				console.log(message);
				pc.setLocalDescription(new RTCSessionDescription(message));
				console.log(message);
				sendMessage(message);
			});
			break;
		}
		case "answer": {
			console.log("set remote description in answer");
			pc.setRemoteDescription(new RTCSessionDescription(message));
			getRemote = true;
			initDataChannel();
			break;
		}
		case "candidate": {
			console.log(message);
			var candidate = new RTCIceCandidate({
				sdpMLineIndex: message.sdpMLineIndex,
				candidate: message.candidate
			});
			console.log(candidate);
			timer = setInterval(() => {
				if (getRemote) {
					pc.addIceCandidate(candidate);
					clearInterval(timer);
				}
			}, 200);

			console.log("Add candidate");
			break;
		}
	}
});

function sendMessage(message) {
	socket.emit("message", message);
}

pc = new RTCPeerConnection();
pc.onicecandidate = event => {
	console.log("On candidate");
	if (event.candidate) {
		sendMessage({
			type: "candidate",
			sdpMLineIndex: event.candidate.sdpMLineIndex,
			candidate: event.candidate.candidate
		});
	}
};
function doCall() {
	pc.createOffer().then(description => {
		pc.setLocalDescription(description);
		sendMessage(description);
	});
}
let sendDataChannel, receiveDataChannel;

function initDataChannel() {}
sendDataChannel = pc.createDataChannel("sendDataChannel", null);
textareaEle.onkeydown = e => {
	console.log(sendDataChannel);
	console.log(e);
	sendDataChannel.send(e.key);
};

sendDataChannel.onopen = function(event) {
	var readyState = sendDataChannel.readyState;
	if (readyState == "open") {
		sendDataChannel.send("Hello");
	}
};

pc.ondatachannel = event => {
	receiveDataChannel = event.channel;
	receiveDataChannel.onmessage = event => {
		textareaEle.value += event.data;
	};
};
// }
