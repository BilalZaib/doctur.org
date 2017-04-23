var mediaStream = null;
var peer = null;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function init_peer() {
    if (peer != null) return;

    peer = new Peer({
        key: 's1qck2af39vpwrk9',
        debug: 3
    });

    peer.on('open', function() {
        $('#my-id').text(peer.id);
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

    // Click handlers setup
$(document).ready(function() {
    $('#make-call').click(function() {
        // Initiate a call!
        var call = peer.call($('#callto-id').val(), window.localStream);

        step3(call);
    });

    $('#end-call').click(function() {
        window.existingCall.close();
        step2();
    });
});



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
        enable_video();
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
