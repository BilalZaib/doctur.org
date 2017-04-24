var mediaStream = null;
var peer = null;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var socket = null;
var video_status = false;
var my_peerid = null;
var their_peerid = null;
var peer_api_key = 's1qck2af39vpwrk9';

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
			their_id = data.peerid;
			$("#their-id").html(data.peerid);
			
			if (peer == null) {
				enable_video();
			}

			start_call(their_id)
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

		show_my_video();
		init_peer();

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


function init_peer() {
	console.log("Peer intialized");
    if (peer != null) return;
    else {
    	socket.send(JSON.stringify({type: "start_video_call", content: my_peerid, talk_id: talk_id}))        
	}
    peer = new Peer({
        key: peer_api_key,
        debug: 3
    });

    peer.on('open', function() {
        $('#my-id').text(peer.id);
		my_peerid = peer.id;
		socket.send(JSON.stringify({type: "start_video_call", content: peer.id, talk_id: talk_id}))        
    });

    // Receiving a call
    peer.on('call', function(call) {
        // Answer the call automatically (instead of prompting user) for demo purposes
        call.answer(window.localStream);
        step3(call);
    });
    peer.on('error', function(err) {
        alert(err.message);
    });
}

function start_call (their_id) {
    // Initiate a call!
    var call = peer.call(their_id, window.localStream);

    step3(call);
}

function end_call() {
        window.existingCall.close();
        step2();
  
}

function show_my_video() {
    // Get audio/video stream
    navigator.getUserMedia({
        audio: true,
        video: true
    }, function(stream) {
        // Set your video displays
        $('#my-video').prop('src', URL.createObjectURL(stream));

        window.localStream = stream;

        mediaStream = stream;
        mediaStream.stop = function () {
            this.getAudioTracks().forEach(function (track) {
                track.stop();
            });
            this.getVideoTracks().forEach(function (track) { //in case... :)
                track.stop();
            });
        };
    }, function() {
        //Toggle video close
        //enable_video();
        alert("Enable Video Failed");
    });
}

function hide_my_video() {
    mediaStream.stop();
}

function step3(call) {
    // Hang up on an existing call if present
    if (window.existingCall) {
        window.existingCall.close();
    }

    // Wait for stream on the call, then set peer video display
    call.on('stream', function(stream) {
        $('#their-video').prop('src', URL.createObjectURL(stream));
    });

    // UI stuff
    window.existingCall = call;
    $('#their-id').text(call.peer);
    call.on('close', step2);
}
