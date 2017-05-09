var selfEasyrtcid = "";
easyrtc.setSocketUrl("//192.168.0.201:7881");

var socket = null;
var video_status = false;
var myid = null;
var theirid = null;

var i_am_caller = true;

var room = '_' + Math.random().toString(36).substr(2, 32);
console.log ("Room = " + room);

function setMessageElement(pic, msg, name, date) {
	var other_user = $("#other-user");
	var current_user = $("#current-user");

	if (pic != null) {
		var elem = other_user.clone();
		if (pic == true)
			elem.find("#pic").attr("src","/static/img/male.png");
		else
			elem.find("#pic").attr("src",pic);
	}
	else {
		var elem = current_user.clone();
	}
	
	elem.find("#msg").text(msg);
	elem.find("#name").text(name);
	elem.find("#date").text(date);

	$("#chat-default").remove();

	$("#chat-box").append(elem);

	//if (pic == null)
	$("#chat-box").scrollTop($("#chat-box")[0].scrollHeight);
}

function init_websocket() {
	socket = new WebSocket("ws://" + window.location.host + "/talk/");

	socket.onmessage = function(e) {
		data = JSON.parse(e.data);
		if (data.type == "receive_message") {
		    if (data.username == user)
			    setMessageElement(null, data.content, data.username, data.timestamp);
			else
			    setMessageElement(true, data.content, data.username, data.timestamp);
		}
		else if (data.type == "start_video_call") {
			console.log("Request received for call")
			i_am_caller = false;
			room = data.peerid;
			enable_video();
		}
	}

	socket.onopen = function() {
	    $("#status").text("Connected");
	    $("#status").css("color", "green");
	}
	
	socket.onclose = function() {
		$("#status").text("Disconnected");
	    $("#status").css("color", "red");

	}

	if (socket.readyState == WebSocket.OPEN) socket.onopen();
}

function send_message(e) {
	var content = $("#content").val();
	$("#content").val("");
	if (content) {
		socket.send(JSON.stringify({type: "send_message", content: content, talk_id: talk_id}))
	}
}

function enable_video() {	
	if (video_status == false) {
		$(".chat-area").removeClass("col-sm-12");
		$(".video-area").removeClass("col-sm-12");
		
		$(".chat-area").addClass("col-sm-6");
		$(".video-area").addClass("col-sm-6");
		
		$(".video-area").show(1000);
		
		$(".video-btn").text("Disable Video");
		$(".video-btn").removeClass("btn-primary");
		$(".video-btn").addClass("btn-danger");
		
		video_status = true;

		connect();
	}

	else {
		$(".chat-area").removeClass("col-sm-6");
		$(".video-area").removeClass("col-sm-6");
		
		$(".chat-area").addClass("col-sm-12");
		$(".video-area").addClass("col-sm-12");
		
		$(".video-area").hide();

		$(".video-btn").text("Enable Video");
		$(".video-btn").addClass("btn-primary");
		$(".video-btn").removeClass("btn-danger");
		
		video_status = false;

		hide_my_video();
	}	
}

$(document).ready(function() {
	init_websocket();

	setInterval(function() {
		if (socket.readyState == WebSocket.CLOSED) {
			$("#status").text("Reconnecting...");
		    $("#status").css("color", "blue");
			init_websocket();
		}
	}, 3000);

	$("#chat-box").scrollTop($("#chat-box")[0].scrollHeight);

	$("#content").keypress(function(ev) {
	    console.log("Content changed.");
	    var keycode = (ev.keyCode ? ev.keyCode : ev.which);
        if (keycode == '13') {
        	send_message();
	        $("#content").val("");
        }
	});


	$("#send").click(send_message);

	//setMessageElement(null, "How are you?", "Owais Chishti", Date());
	//setMessageElement(true, "I am fine.", "Bilal Zaib", Date());
});

function hide_my_video() {}

function connect() {
    easyrtc.joinRoom(room);
    console.log(room);
    easyrtc.setVideoDims(640,480);
    easyrtc.setRoomOccupantListener(convertListToButtons);
    easyrtc.easyApp("easyrtc.audioVideoSimple", "my-video", ["their-video"], loginSuccess, loginFailure);
}


function convertListToButtons (roomName, data, isPrimary) {
	console.log(data);
    for(var easyrtcid in data) {
		console.log ("Other is connected");
		console.log(easyrtcid);
		their_id = easyrtc.idToName(easyrtcid)
		console.log(their_id);
		$("#their-id").html(their_id);
		performCall(easyrtcid);
	}
}


function performCall(otherEasyrtcid) {
    easyrtc.hangupAll();

    var successCB = function() {};
    var failureCB = function() {};
    easyrtc.call(otherEasyrtcid, successCB, failureCB);
}


function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
 	myid = easyrtc.cleanId(easyrtcid);   

 	if (i_am_caller) {
 		console.log("Start Call Request Sent");
    	socket.send(JSON.stringify({type: "start_video_call", content: room, talk_id: talk_id}))
    }
    $("#my-id").html(myid);
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}
