const express = require('express')
const Raspistill = require('node-raspistill').Raspistill;
const i2cBus = require('i2c-bus')
const servoDriver = require('pca9685').Pca9685Driver
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const jpeg = require('jpeg-js')
/* 
servo 0
	coin hopper: 530
	camera: 320
	drop: 150
servo 1
	leftmost: 465
	rightmost: 240
hopper spots
	0:240
	1:296
	2:352
	3:408
	4:465
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
	 var power = true /* let motors turn */
	 var loopCoins = false /* is loop on*/
		var loadedCoins = 0 /* for data gathering, which coins are on */
	 var sleep = (ms) => {
		 return new Promise((resolve, reject) => {
			 setTimeout(() => {resolve('OK')}, ms)
		 })
	 }
	 /*
	 coin hopper: 530
	camera: 320
	drop: 150
	 */
	 var motors = {
		coinSlot(slotNumber) {
			return new Promise((resolve, reject) => {
				if(!power) return reject('powered down')
				var slot = 240
				switch(slotNumber) {
					case 0:
						slot = 240
						break;
					case 1:
						slot = 296
						break;
					case 2:
						slot = 352
						break;
					case 3:
						slot= 408
						break;
					case 4:
						slot = 465
						break;
				}
				pwm.setPulseRange(1, 0, slot, function(err) {
					if (err) {
						console.error("Error setting pulse range." + err);
						reject(err)
					} else {
						resolve('OK')
					}
				});			
			})
		},
		hopper() {
			return new Promise((resolve, reject) => {
				if(!power) return reject('powered down')
				pwm.setPulseRange(0, 0, 530, function(err) {
					if (err) {
						console.error("Error setting pulse range." + err);
						reject(err)
					} else {
						sleep(400).then(() => {
							pwm.setPulseRange(0, 0, 490, function(errT) {
								if (errT) {
									reject(err)
								} else {
									resolve('OK')
								}
							})
						})
					}
				});			
			})
		},
		camera() {
			return new Promise((resolve, reject) => {
				if(!power) return reject('powered down')
				pwm.setPulseRange(0, 0, 320, function(err) {
					if (err) {
						console.error("Error setting pulse range." + err);
						reject(err)
					} else {
						resolve('OK')
					}
				});			
			})
		},
		dropper() {
			return new Promise((resolve, reject) => {
				if(!power) return reject('powered down')
				pwm.setPulseRange(0, 0, 150, function(err) {
					if (err) {
						console.error("Error setting pulse range." + err);
						reject(err)
					} else {
						resolve('OK')
					}
				});			
			})
		}
	 }
	 var pictureCoin = () => {
		return new Promise((resolve, reject) => {
			motors.hopper().then(() => {
				console.log('hopper')
				sleep(1000).then(() => {
					console.log('sleep')
					motors.camera().then(() => {
						console.log('camera')
						camera.takePhoto().then((photo) => {
							console.log('photo taken')
							resolve(photo)
						}).catch(e=>reject())
					}).catch(e=>reject())
				}).catch(e=>reject())
			}).catch(e=>reject())
		})
	 }
	 var detectCoin = (image) => {
		
	 }

	 io.on('connection', socket => {
		console.log('user connected!')
		/*DEBUG START*/
		socket.on('getpower', () => {
			console.log('get power requested')
			io.emit('power', power)
		})
		socket.on('setpower', (newPower) => {
			console.log('socket power state set', newPower)
			power = newPower
			if(power) {
				pwm.channelOff(0)
				pwm.channelOff(1)
			} else {
				pwm.channelOn(0)
				pwm.channelOn(1)
			}
			io.emit('power', power)
		})
		socket.on('servo', data => {
			console.log(data)
			if(power) {
				var servo = data.channel
				var val = data.val > 150 ? data.val < 600 ? data.val : 600 : 150
				pwm.setPulseRange(servo, 0, val, (err) => {
					if(err) {
						console.log(err)
					}
				})
			}
		})
		socket.on('slot', num => {
			motors.coinSlot(num).then(e => {io.emit('console', e)}).catch(e => {io.emit('console', e)})
		})
		socket.on('rotor', state => {
			switch(state){
				case 0:
					motors.hopper().then(e => {io.emit('console', e)}).catch(e => {io.emit('console', e)})
					break;
				case 1:
					motors.camera().then(e => {io.emit('console', e)}).catch(e => {io.emit('console', e)})
					break;
				case 2:
					motors.dropper().then(e => {io.emit('console', e)}).catch(e => {io.emit('console', e)})
					break;
				default:
					io.emit('console', 'invalid data')
			}
		})
		/*DEBUG END*/

		socket.on('newPhoto', data => {
			camera.takePhoto().then((photo) => {
				io.emit('coinPhoto', 'data:image/jpg;base64,' + photo.toString('base64'))
			}).catch(e => {console.log(e);io.emit('console', e)})
		})
		socket.on('newCoin', () => {
			pictureCoin().then(coinImage => {
				var pixels = jpeg.decode(coinImage, true)
				console.log(pixels)
				io.emit('coinPhoto', 'data:image/jpg;base64,' + coinImage.toString('base64'))
			}).catch(e => {console.log(e);io.emit('console', e)})
		})

		var coinLooper = () => {
			if(loopCoins) {
				console.log('starting scan on coin')
				pictureCoin().then(coinImage => {
					console.log('coin pictured')
					io.emit('console', 'coin pictured')
					io.emit('coinPhoto', 'data:image/jpg;base64,' + coinImage.toString('base64'))
					motors.dropper().then(() => {
						sleep(500).then(() => {
							if(loopCoins) {
								coinLooper()
							}
						}).catch(e => {console.log(e);io.emit('console', e);io.emit('loop', false);loopCoins = false})
					}).catch(e => {console.log(e);io.emit('console', e);io.emit('loop', false);loopCoins = false})
				}).catch(e => {console.log(e);io.emit('console', e);io.emit('loop', false);loopCoins = false})
			}
		}

		socket.on('getLoop', () => {
			io.emit('loop', loopCoins)
		})
		socket.on('setLoop', newLoop => {
			loopCoins = newLoop
			if(loopCoins) {
				coinLooper()
			}
			io.emit('console', 'loop state switched')
			io.emit('loop', newLoop)
		})
		socket.on('getCoin', () => {
			io.emit('coin', loadedCoins)
		})
		socket.on('setCoin', newCoin => {
			loadedCoins = newCoin
			io.emit('console', 'loaded coins set to '+newCoin)
			io.emit('coin', loadedCoins)
		})

		io.emit('power', power)
		io.emit('loop', loopCoins)
		io.emit('coin', loadedCoins)

		socket.on('disconnect', (reason) => {
			 console.log('user disconnected', reason)
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
