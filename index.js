const express = require('express')
const Raspistill = require('node-raspistill').Raspistill;
const i2cBus = require('i2c-bus')
const servoDriver = require('pca9685').Pca9685Driver
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
/* 
servo 0
	coin hopper: 530
	camera: 320
	drop: 150
servo 1
	leftmost: 465
	rightmost: 240
*/
app.use('/', express.static('public'))
var options = {
	i2c: i2cBus.openSync(1),
	address: 0x40,
	frequency: 60,
	debug: false
}

const camera = new Raspistill({
  noFileSave: true,
	noPreview: true,
	height: 100,
	width: 100,
	time: 1000
});

var pwm = new servoDriver(options, (err) => {
	if(err) {
		console.log(err)
		process.exit(-1)
	}
	console.log('pwm initialization done')

	/*app.get('/setservo/:channel/:value', (req, res) => {
		req.params.value = req.params.value > 150 ? req.params.value : 150
		req.params.value = req.params.value < 600 ? req.params.value : 600
		console.log(req.params.value)
		pwm.setPulseRange(req.params.channel-1+1, 0, req.params.value-1+1, function() {
    	if (err) {
				res.send(err + req.params.value)
        console.error("Error setting pulse range.");
      } else {
				res.send('OK')
      	console.log("Pulse range set.");
      }
		});
	 });*/
	 io.on('servoSet', data => {
		 var servo = data.channel
		 var val = data.val > 150 ? data.val < 600 ? data.val : 600 : 150
		 pwm.setPulseRange(servo, 0, val, (err) => {
			 if(err) {
				 console.log(err)
			 }
		 })
	 })
	app.get('/', (req, res) => {
		camera.takePhoto().then((photo) => {
//		console.log(JSON.stringify(camera))
			res.contentType('image/jpeg')
			res.end(photo, 'binary')
		});
	})
	app.get('/diag', (req, res) => {res.send(JSON.stringify(camera))})
	http.listen(8080, () => console.log('web server online'))
})
