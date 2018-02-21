var WioNode = require("./wio.js");
var wioConfig = require("./sensor-config.js").wio_iot;

// construct a Wio board
var board = new WioNode({
    "debug": true,
    "token": wioConfig.access_token,
    "location": wioConfig.location
});


// continuous reading, once every 1 seconds
board.stream('GroveLuminanceA0', 'luminance', 1000, function(data, error){
    if( data != null ) {
        // console.log(data);

        if( data['luminance'] < 500 ) {
            // write once to buzzer/speaker, to make a sound
            board.write(null, 'GroveSpeakerD0', 'sound_ms', '443', '1000');            
        }
    }
});

// stop continuous reading after 22 seconds
setTimeout(function(){
    board.stopStream('GroveLuminanceA0', 'luminance');
}, 22000);


