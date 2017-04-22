var other_user = $("#other-user");
var current_user = $("#current-user");

function setMessageElement(pic, msg, name, date) {
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

	$("#chat-box").scrollTop($("#chat-box")[0].scrollHeight);
}

function moveToTalk(id) {
	$.get("/talk/get-talk", {users: id}, function(data, status){
    	window.location.href = "/talk/" + id;
    });
}

// Set first parameter to true for default image.

$(document).ready(function() {
	setMessageElement(null, "How are you?", "Owais Chishti", Date());
	setMessageElement(true, "I am fine.", "Bilal Zaib", Date());
});


// Note that the path doesn't matter for routing; any WebSocket
// connection gets bumped over to WebSocket consumers

socket = new WebSocket("ws://" + window.location.host + "/talk/");

socket.onmessage = function(e) {
    console.log(e.data);
}

socket.onopen = function() {
    socket.send({
    	'type': 'login',
    	'user': user
    });
}

// Call onopen directly if socket is already open
if (socket.readyState == WebSocket.OPEN) socket.onopen();