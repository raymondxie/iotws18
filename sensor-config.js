//
// An sample config file looks like below, please take only the sensors that you are using,
// also make sure the attribute name (attr) and initial value (val) are properly set for your case.
// If you have other type of sensor, you can add an entry in this config file, and extend corresponding
// client.js code
//

var exports = module.exports = {};

// For Wio Node and sensors
// {
//   "pin": "GroveLuminanceA0", -- which connector. Find it from Wio App - "View API" page 
//   "type": "INPUT",           -- type: INPUT or OUTPUT
//   "property": "humidity",    -- type of property / action, when calling to Wio virtualization server. See "View API" page
//   "attr": "humidity",        -- device model attribute, as defined in IoTCS backend
//   "val": 0                   -- default value for a model attribute
// }
exports.wio_node = [
/*
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
*/
  {
    // Light Sensor
    "type": "INPUT",
    "pin": "GroveLuminanceA0",
    "property": "luminance",
    "attr": "light",
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

// wio-link
// exports.wio_iot = {
//   "location": "us",
//   "token": "e922a7f9cba75778c840aed07c9ff306"
// };

// wio-node
exports.wio_iot = {
  "location": "us",
  "token": "30802fbf0934dd3233913dfdf3bf970d"
};

