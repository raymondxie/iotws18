var WioNode = require("./wio.js");
var wioConfig = require("./sensor-config.js").wio_iot;

//
// As example, I just use one callback function to display data
//
// You may want to supply an anonymous function to handle the async callback from Wio board interfaction.
// in each of you board.write(), board.read() or board.stream() call.
var callback = function(data, error) {
    if( data != null )
        console.log("data->", data);
    if( error != null)
        console.log("error->", error);
}

// construct a Wio board
var board = new WioNode({
    "debug": true,
    "token": wioConfig.access_token,
    "location": wioConfig.location
});


//
// possible calls to Wio board 
//
// write once
board.write(callback, 'GroveSpeakerD0', 'sound_ms', '443', '1000');
// read once
board.read(callback, 'GroveTempHumD1', 'humidity');
// read once
board.read(callback, 'GroveLuminanceA0', 'luminance');

// continuous reading
board.stream('GroveTempHumD1', 'temperature', 10000, callback);
// stop continuous reading after 20 seconds
setTimeout(function(){
    board.stopStream('GroveTempHumD1', 'temperature');
}, 50000);



