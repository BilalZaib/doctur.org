var socket = null;

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

	if (pic == null)
		$("#chat-box").scrollTop($("#chat-box")[0].scrollHeight);
}



function moveToTalk(id) {
	$.get("/talk/get-talk", {users: id}, function(data, status){
		console.log(data);
    	window.location.href = "/talk/" + data;
    });
}

function init_websocket() {
	socket = new WebSocket("ws://" + window.location.host + "/talk/");

	socket.onmessage = function(e) {
		data = JSON.parse(e.data);
	    if (data.username == user)
		    setMessageElement(null, data.content, data.username, data.timestamp);
		else
		    setMessageElement(true, data.content, data.username, data.timestamp);
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

video_status = false;

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



