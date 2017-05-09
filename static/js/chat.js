var mediaStream = null;
var peer = null;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var socket = null;
var call_button_status = true;
var my_peerid = null;
var their_peerid = null;
var peer_api_key = 's1qck2af39vpwrk9';
var i_am_caller = true;
var device_accessed = false;

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
			console.log("Call received");
			call_received(data);
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

function video_ui(hide_ui = false) {
	if (hide_ui == false) {
		call_button_status = false;

		$(".chat-area").removeClass("col-sm-12");
		$(".video-area").removeClass("col-sm-12");
		
		$(".chat-area").addClass("col-sm-6");
		$(".video-area").addClass("col-sm-6");
		
		$(".video-area").show(1000);
		
		$(".video-btn").text("Disable Video");
		$(".video-btn").removeClass("btn-primary");
		$(".video-btn").addClass("btn-danger");
	}

	else {
		call_button_status = true;

		$(".chat-area").removeClass("col-sm-6");
		$(".video-area").removeClass("col-sm-6");
		
		$(".chat-area").addClass("col-sm-12");
		$(".video-area").addClass("col-sm-12");
		
		$(".video-area").hide();

		$(".video-btn").text("Enable Video");
		$(".video-btn").addClass("btn-primary");
		$(".video-btn").removeClass("btn-danger");
	}
}

function enable_video() {	
	
	if (call_button_status == true) {
		// Setup camera and audio
		// Also init init_peer, Create user peer key and send to receiver

		if (i_am_caller) {
			their_name = $("#their-name").text();
			modal = $("#callModal")
			modal.find("#call-title").html("Calling <b>" + their_name + "</b>...");
			modal.find("#call-message").html("Contacting...");
			modal.find("#progress").show().attr("aria-valuenow", 33);
			$("#callModal").modal();
		}	
		show_my_video();
	}
	else {
		end_call();
	}
	call_button_status = !call_button_status;
}

function init_peer() {
	$("#callModal").find("#call-message").html("Initiating...");


    peer = new Peer({
        key: peer_api_key,
        debug: 3
    });

    peer.on('open', function() {
		$("#callModal").find("#call-message").html("Connected...");

        // Connection started
        console.log("I get my PeerID");
        $('#my-id').text(peer.id);

		my_peerid = peer.id;

		// Send my peer id to people in current talk
		if (i_am_caller) {
			console.log("Caller send request for calling...")
			$("#callModal").find("#call-message").html("Requesting user...")
			socket.send(JSON.stringify({type: "start_video_call", content: peer.id, talk_id: talk_id}))        

			console.log("Timer set");
			setTimeout(function() {
				console.log("Timer called");
				$("#callModal").modal('hide');
				$("#callModal").find("#call-title").html("No Response");
				$("#callModal").find("#call-message").html("User is currently unavailable");
				$("#callModal").modal();
				end_call();

				setTimeout(function() {
					$("#callModal").modal('hide');
				}, 2000);
			}, 3000)
    	}
    	else {
    		// I am receiver hence, I have their's ID.
    		$("#callModal").modal('hide');
    		start_call(their_id)
    	}
    });

    // Receiving a call
    peer.on('call', function(call) {
        // Start the call
        video_ui();
        console.log("Receiving call to answer");
		$("#callModal").modal('hide');
        call.answer(window.localStream);
        step3(call);
    });

    peer.on('error', function(err) {
        alert(err.message);
    });
}

function call_received(data) {
	i_am_caller = false;

	id = data.peerid || 420
	username = data.callername || "Anonymous"

	their_name = $("#their-name").text();
	modal = $("#callModal")
	modal.find("#call-title").html("<b>" + username + "</b> is calling you...");
	modal.find("#call-message").html('<div class="center-box"><button class="btn btn-success" onclick=\'callAnswer(\"' + id + '\")\'>Answer</button> - <button class="btn btn-danger" onclick="callReject()">Reject</button></div>');
	modal.find("#progress").hide();
	$("#callModal").modal();
}

function callAnswer(id) {
	their_id = id;
	$("#their-id").html(id);
	
	if (peer == null) {
		// I am receiving call create my id and send it to caller.
		show_my_video();
	}
}

function callReject() {
	$("#callModal").modal();	
	socket.send(JSON.stringify({type: "reject_video_call", content: my_peerid, talk_id: talk_id}));        
}

function send_message(e) {
	var content = $("#content").val();
	$("#content").val("");
	if (content) {
		socket.send(JSON.stringify({type: "send_message", content: content, talk_id: talk_id}))
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




function start_call (their_id) {
    var call = peer.call(their_id, window.localStream);
    step3(call);
    video_ui();
}

function end_call() {
    if (window.existingCall)
    	window.existingCall.close();
    video_ui(true);
    hide_my_video();
    peer = null;
    i_am_caller = true;
    //step2();  
    call_button_status = true;
}

function show_my_video() {
	constraints = { audio: true, video: true };
    // Get audio/video stream
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
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

        // Start peer instance
        init_peer();

	}).catch(function(err) {
		console.log(err);
    	alert("ERROR: " + err.message);	
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
        console.log(stream);
        $('#their-video').prop('src', URL.createObjectURL(stream));
    });

    // UI stuff
    window.existingCall = call;
    $('#their-id').text(call.peer);
    call.on('close', function () {
    	console.log("Call closed")
    	end_call();
    });
}
