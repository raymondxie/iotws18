
var serverLocation = 'us'
var nodeToken = 'e922a7f9cba75778c840aed07c9ff306'

var nodePort = 'GroveLedWs2812D0'
//var nodePort = 'GroveGyroITG3200I2C0'
// var nodePort = 'GroveAirqualityA0'
var wioClient = require('node-wio-link')(serverLocation)
// var url = 'https://us.wio.seeed.io/v1/node/GroveGyroITG3200I2C0/temperature'
// var url = 'https://us.wio.seeed.io/v1/node/GroveLedWs2812D0/clear/28/00FF00'
// var pma = 'temperature'
var pma = 'clear'

wioClient.node.write(nodeToken, nodePort, pma, "15", "00FFFF")
  .then(function(data) {
          console.log(data)
                })
  .catch(function(error) {
          console.log(error)
                });
