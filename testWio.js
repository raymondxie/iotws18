
var serverLocation = 'us'
var nodeToken = 'e922a7f9cba75778c840aed07c9ff306'
// var nodePort = 'GroveLedWs2812D0'
var nodePort = 'GroveGyroITG3200I2C0'
// var nodePort = 'GroveAirqualityA0'
var wioClient = require('node-wio-link')(serverLocation)
var url = 'https://us.wio.seeed.io/v1/node/GroveGyroITG3200I2C0/temperature'
var pma = 'temperature'

wioClient.node.read(nodeToken, nodePort, pma)
  .then(function(data) {
          console.log(data)
                })
  .catch(function(error) {
          console.log(error)
                });
