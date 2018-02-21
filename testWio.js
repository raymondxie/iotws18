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
// write once to buzzer/speaker, to make a sound
board.write(callback, 'GroveSpeakerD0', 'sound_ms', '443', '1000');

// read once luminance from light sensor
board.read(callback, 'GroveLuminanceA0', 'luminance');

// read once for humidity
// board.read(callback, 'GroveTempHumD1', 'humidity');
// read once for temperature
// board.read(callback, 'GroveTempHumD1', 'temperature');

// continuous reading, once every 5 seconds
board.stream('GroveLuminanceA0', 'luminance', 5000, callback);

// stop continuous reading after 22 seconds
setTimeout(function(){
    board.stopStream('GroveLuminanceA0', 'luminance');
}, 22000);


