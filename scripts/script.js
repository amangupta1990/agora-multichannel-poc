/**
 * @name handleFail
 * @param err - error thrown by any function
 * @description Helper function to handle errors
 */
let handleFail = function(err){
    console.log("Error : ", err);
};

// Queries the container in which the remote feeds belong
let remoteContainer= document.getElementById("remote-container");
let canvasContainer =document.getElementById("canvas-container");
/**
 * @name addVideoStream
 * @param streamId
 * @description Helper function to add the video stream to "remote-container"
 */
function addVideoStream(streamId){
    let streamDiv=document.createElement("div"); // Create a new div for every stream
    streamDiv.id=streamId;                       // Assigning id to div
    streamDiv.style.transform="rotateY(180deg)";
    debugger; // Takes care of lateral inversion (mirror image)
    remoteContainer.appendChild(streamDiv);      // Add new div to container
}
/**
 * @name removeVideoStream
 * @param evt - Remove event
 * @description Helper function to remove the video stream from "remote-container"
 */
function removeVideoStream (evt) {
    let stream = evt.stream;
    stream.stop();
    let remDiv=document.getElementById(stream.getId());
    remDiv.parentNode.removeChild(remDiv);
    console.log("Remote stream is removed " + stream.getId());
}

function addCanvas(streamId){
    let canvas=document.createElement("canvas");
    canvas.id='canvas'+streamId;
    canvasContainer.appendChild(canvas);
    let ctx = canvas.getContext('2d');
    let video=document.getElementById(`video${streamId}`);

    video.addEventListener('loadedmetadata', function() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });
    debugger;
    video.addEventListener('play', function() {
        var $this = this; //cache
        (function loop() {
            if (!$this.paused && !$this.ended) {
                ctx.drawImage($this, 0, 0);
                setTimeout(loop, 1000 / 30); // drawing at 30fps
            }
        })();
    }, 0);
}

//teacherclient 
let teacherClient = AgoraRTC.createClient({
    mode: 'live',
    codec: "h264"
});

var url_string = document.location.href; //window.location.href
var url = new URL(url_string);
var user = url.searchParams.get("user");


// Client Setup
// Defines a client for RTC
let student = AgoraRTC.createClient({
    mode: 'live',
    codec: "h264"
})


if(user === "teacher")
setupTeacher(teacherClient);
else 
setupStudent(student)

function setupTeacher(client){

// Client Setup
// Defines a client for Real Time Communication
client.init("10351fd4ffb4448d8e3ca8f36c638057",() => console.log("AgoraRTC client initialized") ,handleFail);

// The client joins the channel
client.join(null,"classroom",null, (uid)=>{

    // Stream object associated with your web cam is initialized
    let localStream = AgoraRTC.createStream({
        streamID: uid,
        audio: true,
        video: true,
        screen: false
    });

    // Associates the stream to the client
    localStream.init(function() {

        //Plays the localVideo
        localStream.play('me');

        //Publishes the stream to the channel
        client.publish(localStream, handleFail);

    },handleFail);

},handleFail);
//When a stream is added to a channel
client.on('stream-added', function (evt) {
    client.subscribe(evt.stream, handleFail);
});
//When you subscribe to a stream
client.on('stream-subscribed', function (evt) {
    let stream = evt.stream;
    addVideoStream(String(stream.getId()));
    stream.play(String(stream.getId()));
    addCanvas(String(stream.getId()));
});
//When a person is removed from the stream
client.on('stream-removed',removeVideoStream);
client.on('peer-leave',removeVideoStream);
}


function setupStudent(client){

    // Client Setup
    // Defines a client for Real Time Communication
    client.init("10351fd4ffb4448d8e3ca8f36c638057",() => console.log("AgoraRTC client initialized") ,handleFail);
    
    // The client joins the channel
    client.join(null,"classroom",null, (uid)=>{
    
        // Stream object associated with your web cam is initialized
        let localStream = AgoraRTC.createStream({
            streamID: uid,
            audio: true,
            video: true,
            screen: false
        });
    
        // Associates the stream to the client
        localStream.init(function() {
    
            //Plays the localVideo
            localStream.play('me');
    
            //Publishes the stream to the channel
            client.publish(localStream, handleFail);
    
        },handleFail);


        client.join(null,"breakout",null, (uid)=>{
    
            // Stream object associated with your web cam is initialized
            let localStream = AgoraRTC.createStream({
                streamID: uid,
                audio: true,
                video: true,
                screen: false
            });
        
            // Associates the stream to the client
            localStream.init(function() {
        
                //Plays the localVideo
                localStream.play('me');
        
                //Publishes the stream to the channel
                client.publish(localStream, handleFail);
        
            },handleFail);
        
        },handleFail);
    
    },handleFail);


   



    //When a stream is added to a channel
    client.on('stream-added', function (evt) {
        client.subscribe(evt.stream, handleFail);
    });
    //When you subscribe to a stream
    client.on('stream-subscribed', function (evt) {
        let stream = evt.stream;
        addVideoStream(String(stream.getId()));
        stream.play(String(stream.getId()));
        addCanvas(String(stream.getId()));
    });
    //When a person is removed from the stream
    client.on('stream-removed',removeVideoStream);
    client.on('peer-leave',removeVideoStream);
    }

