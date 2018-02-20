//
// An sample config file looks like below, please take only the sensors that you are using,
// also make sure the attribute name (attr) and initial value (val) are properly set for your case.
// If you have other type of sensor, you can add an entry in this config file, and extend corresponding
// client.js code
//

var exports = module.exports = {};

// For Wio Node and sensors
// {
//   "type": "INPUT",           -- type: INPUT or OUTPUT
//   "pin": "GroveLuminanceA0", -- which connector. Find it from Wio App - "View API" page 
//   "property": "humidity",    -- type of property / action, when calling to Wio virtualization server. See "View API" page
//   "attr": "humidity",        -- device model attribute, as defined in IoTCS backend
//   "val": 0                   -- default value for a model attribute
// }
exports.wio_node = [

  {
    // Light Sensor
    "type": "INPUT",
    "pin": "GroveLuminanceA0",
    "property": "luminance",
    "attr": "light",
    "val": 0
  },
  {
    // Humidity sensor
    "type": "INPUT",
    "pin": "GroveTempHumD1",
    "property": "humidity",
    "attr": "humidity",
    "val": 0
  },
  {
    // Temperature sensor
    "type": "INPUT",
    "pin": "GroveTempHumD1",
    "property": "temperature",
    "attr": "temperature",
    "val": 0
  },
  {
    // LED Bar
    "type": "OUTPUT",  
    "pin": "GroveLEDBarUART0",
    "property": "bits",
    "attr": "lightlevel",
    "val": "0"
  },
  {
    // Buzzer
    "type": "OUTPUT",  
    "pin": "GroveSpeakerD0",
    "property": "sound_ms",
    "attr": "soundfreq",
    "val": "0"
  }
];

// customize Wio server
exports.wio_iot = {
  "location": "http://129.150.86.239:8080",
  "access_token": "94ef3060fb964724e42c1f3d1c6cd116"
};

// wio-link
// exports.wio_iot = {
//   "location": "us",
//   "access_token": "6285cad2c451e2da8d3e0b054c9127aa"
// };

// wio-node
// exports.wio_iot = {
//   "location": "us",
//   "access_token": "30802fbf0934dd3233913dfdf3bf970d"
// };

