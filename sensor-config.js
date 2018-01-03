// The config file indicates how your GrovePi sensors are connected,
//    pin   - indicates which socket the sensor is connected to
//    type  - sensor type label, matching with switch() code in mainClient.js
//    attr  - the attribute name in device model that this sensor data is corresponding to
//    val   - the initial value for this attribute
//
// An sample config file looks like below, please take only the sensors that you are using,
// also make sure the attribute name (attr) and initial value (val) are properly set for your case.
// If you have other type of sensor, you can add an entry in this config file, and extend corresponding
// *-lient.js code
//
/*
var config = [
  {
    "pin": "A0",
    "type": "SoundAnalogSensor"
  },
  {
    "pin": "A1",
    "type": "RotaryAngleAnalogSensor"
  },
  {
    "pin": "A2",
    "type": "LightAnalogSensor"
  },
  {
    "pin": "D4",
    "type": "LEDSocketKit"
  },
  {
    "pin": "D5",
    "type": "TemperatureAndHumiditySensor"
  },
  {
    "pin": "D7",
    "type": "Button"
  },
  {
    "pin": "D8",
    "type": "Buzzer"
  },
  {
    "pin": "D6",
    "type": "UltrasonicRanger"
  }
];
*/

var exports = module.exports = {};

exports.grovepi = [
  {
    "pin": "A2",
    "type": "RotaryAngleAnalogSensor",
    "attr": "angle",
    "val": 0
  },
  {
    "pin": "A1",
    "type": "LightAnalogSensor",
    "attr": "light",
    "val": 0
  },
  {
    "pin": "D3",
    "type": "Button",
    "attr": "button",
    "val": false
  }
];

exports.wio_node = [
  {
    "pin": "A2",
    "type": "RotaryAngleAnalogSensor",
    "attr": "angle",
    "val": 0
  },
  {
    "pin": "A1",
    "type": "LightAnalogSensor",
    "attr": "light",
    "val": 0
  },
  {
    "pin": "D3",
    "type": "Button",
    "attr": "button",
    "val": false
  }
];

exports.wio_iot = {
  "location": "us",
  "token": "678daf8d876b57be49cceee69d69308a"
};

/*
// exports.wio_iot = {
//   "location": "us",
//   "token": "e922a7f9cba75778c840aed07c9ff306"
// };
*/
