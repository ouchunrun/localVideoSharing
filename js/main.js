let localVideo = document.getElementById('localVideo');
let remoteVideo = document.getElementById('remoteVideo');
let uploadFile = document.getElementById("uploadFile");
let fileURL = "";

let stream;
let pc1;
let pc2;
let offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
let startTime;

uploadFile.addEventListener("change", function () {
    trace("uploadFile is change!");
    let file = null;
    try{
        file = uploadFile.files[0];
        fileURL = window.URL.createObjectURL(file);

        let typeJudge = file.type.split("/")[0];
        if(typeJudge === "audio" || typeJudge === "video"){
            localVideo.src = fileURL;
        }else if(typeJudge === "image"){
            setCanvas(fileURL);
        }else {
            console.log("please upload video/audio or image!");
        }
    }catch(e){
        console.log(e.message);
    }
});

function setCanvas(fileURL) {
    console.log("Upload one image");
    let myCanvas = document.getElementById("myCanvas");
    let img = new Image();
    let cxt = myCanvas.getContext("2d");
    cxt.width = 387;
    cxt.height = 200;
    img.src = fileURL;
    img.onload = function () {
        cxt.drawImage(img, 0, 0, cxt.width, cxt.height);
    };
    if (myCanvas.captureStream) {
        stream = myCanvas.captureStream(35);
        console.log('Captured stream from localVideo with captureStream', stream);
        call();
    } else if (myCanvas.mozCaptureStream) {
        stream = myCanvas.mozCaptureStream(35);
        console.log('Captured stream from localVideo with mozCaptureStream()', stream);
        call();
    } else {
        trace('captureStream() not supported');
    }
}


function maybeCreateStream() {
    if (localVideo.captureStream) {
        stream = localVideo.captureStream();
        console.log('Captured stream from localVideo with captureStream', stream);
        call();
    } else if (localVideo.mozCaptureStream) {
        stream = localVideo.mozCaptureStream();
        console.log('Captured stream from localVideo with mozCaptureStream()', stream);
        call();
    } else {
        trace('captureStream() not supported');
    }
}

localVideo.oncanplay = maybeCreateStream;
if (localVideo.readyState >= 3) {
    maybeCreateStream();
}
localVideo.play();


remoteVideo.onloadedmetadata = function() {
    trace('Remote video videoWidth: ' + this.videoWidth +
      'px,  videoHeight: ' + this.videoHeight + 'px');
};

remoteVideo.onresize = function() {
    // 窗口或框架被重新调整大小。
    trace('Remote video size changed to ' +
      remoteVideo.videoWidth + 'x' + remoteVideo.videoHeight);
    if (startTime) {
        let elapsedTime = window.performance.now() - startTime;
        trace('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
        startTime = null;
    }
};

function call() {
    console.log("stream 的信息：");
    let deviceId = stream.getVideoTracks()[0].getSettings().deviceId;
    let aspectRatio = stream.getVideoTracks()[0].getSettings().aspectRatio;
    let height = stream.getVideoTracks()[0].getSettings().height;
    let width = stream.getVideoTracks()[0].getSettings().width;
    let frameRate = stream.getVideoTracks()[0].getSettings().frameRate;
    console.log(deviceId + "\n" + aspectRatio +"\n" + height +"\n" + width + "\n" + frameRate);

    trace('Starting call');
    startTime = window.performance.now();
    let videoTracks = stream.getVideoTracks();
    let audioTracks = stream.getAudioTracks();
    if (videoTracks.length > 0) {
         trace('Using video device: ' + videoTracks[0].label);
    }
    if (audioTracks.length > 0) {
         trace('Using audio device: ' + audioTracks[0].label);
    }

    let servers = null;
    pc1 = new RTCPeerConnection(servers);
    trace('Created local peer connection object pc1');
    pc1.onicecandidate = function(e) {
         onIceCandidate(pc1, e);
    };
    pc2 = new RTCPeerConnection(servers);
    trace('Created remote peer connection object pc2');
    pc2.onicecandidate = function(e) {
         onIceCandidate(pc2, e);
    };

    pc1.oniceconnectionstatechange = function(e) {
        onIceStateChange(pc1, e);
    };
    pc2.oniceconnectionstatechange = function(e) {
        onIceStateChange(pc2, e);
    };
    pc2.ontrack = gotRemoteStream;
    stream.getTracks().forEach(
        function(track) {
            pc1.addTrack(
                track,
                stream
            );
        }
    );
    trace('Added local stream to pc1');
    trace('pc1 createOffer start');
    pc1.createOffer(onCreateOfferSuccess, onCreateSessionDescriptionError, offerOptions);
}

function onCreateSessionDescriptionError(error) {
    trace('Failed to create session description: ' + error.toString());
}

function onCreateOfferSuccess(desc) {
    trace('Offer from pc1\n' + desc.sdp);
    trace('pc1 setLocalDescription start');
    pc1.setLocalDescription(desc, function() {
        onSetLocalSuccess(pc1);
    }, onSetSessionDescriptionError);
    trace('pc2 setRemoteDescription start');
    pc2.setRemoteDescription(desc, function() {
        onSetRemoteSuccess(pc2);
    }, onSetSessionDescriptionError);
    trace('pc2 createAnswer start');
    pc2.createAnswer(onCreateAnswerSuccess, onCreateSessionDescriptionError);
}

function onSetLocalSuccess(pc) {
    trace(getName(pc) + ' setLocalDescription complete');
}

function onSetRemoteSuccess(pc) {
    trace(getName(pc) + ' setRemoteDescription complete');
}

function onSetSessionDescriptionError(error) {
   trace('Failed to set session description: ' + error.toString());
}

function gotRemoteStream(event) {
    if (remoteVideo.srcObject !== event.streams[0]) {
        remoteVideo.srcObject = event.streams[0];
        console.log('pc2 received remote stream', event);
    }
}

function onCreateAnswerSuccess(desc) {
    trace('Answer from pc2:\n' + desc.sdp);
    trace('pc2 setLocalDescription start');
    pc2.setLocalDescription(desc, function() {
        onSetLocalSuccess(pc2);
    }, onSetSessionDescriptionError);
    trace('pc1 setRemoteDescription start');
    pc1.setRemoteDescription(desc, function() {
        onSetRemoteSuccess(pc1);
    }, onSetSessionDescriptionError);
}

function onIceCandidate(pc, event) {
    getOtherPc(pc).addIceCandidate(event.candidate)
    .then(
        function() {
          onAddIceCandidateSuccess(pc);
        },
        function(err) {
          onAddIceCandidateError(pc, err);
        }
    );
    trace(getName(pc) + ' ICE candidate: \n' + (event.candidate ?
        event.candidate.candidate : '(null)'));
}

function onAddIceCandidateSuccess(pc) {
    trace(getName(pc) + ' addIceCandidate success');
}

function onAddIceCandidateError(pc, error) {
    trace(getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
}

function onIceStateChange(pc, event) {
    if (pc) {
        trace(getName(pc) + ' ICE state: ' + pc.iceConnectionState);
        console.log('ICE state change event: ', event);
    }
}

function getName(pc) {
    return (pc === pc1) ? 'pc1' : 'pc2';
}

function getOtherPc(pc) {
    return (pc === pc1) ? pc2 : pc1;
}

