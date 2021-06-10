//import protocol 
var protocol = require('./orchestra-protocol');

//UDP /datagram sockets
var dgram = require('dgram');

var s = dgram.createSocket('udp4');


function Musician(instrument, uuid, lastActivity) {
    this.instrument = instrument;
    this.uuid = uuid;
    this.lastActivity = lastActivity;

    Musician.prototype.update = function() {
        var measure = {
            time: this.lastActivity,
            uuid: this.uuid,
            sound: protocol[instrument]
        };
        var payload = JSON.stringify(measure);

        var message = Buffer.from(payload);
        
        s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
			console.log("Sending payload: " + payload + " via port " + s.address().port);
		});

    }

    setInterval(this.update.bind(this), 500);

}


var instrument = process.argv[2];
var id = require('uuid'); 
const { prototype } = require('events');
var uuid = id.v4();
var time = Date.now(); 

var m1 = new Musician(instrument, uuid, time);