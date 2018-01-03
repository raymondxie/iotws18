var WioNode = require("./wio.js");
var wioConfig = require("./sensor-config.js").wio_iot;

var callback = function(data, error) {
    if( data != null )
        console.log("data->", data);
    if( error != null)
        console.log("error->", error);
}

// construct a Wio board
var board = new WioNode({
    "debug": true,
    "token": wioConfig.token,
    "location": wioConfig.location
});


// write once
board.write(callback, 'GroveSpeakerD0', 'sound_ms', '443', '1000');
// read once
board.read(callback, 'GroveTempHumD1', 'temperature');
// continuous reading
board.stream('GroveTempHumD1', 'temperature', 1000, callback);
// stop continuous reading
setTimeout(function(){
    board.stopStream('GroveTempHumD1', 'temperature');
}, 20000);


/*
var wio = require("./wio3.js");
wio.write(callback, 'GroveSpeakerD2', 'sound_ms', '443', '1000');
var reading = wio.read(callback, 'GroveTempHumD1', 'temperature');
wio.stream('GroveTempHumD1', 'temperature', 1000, callback);
*/

