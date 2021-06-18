//Packages
var protocol = require('./protocol');
//generate uuid
var uuidGenerator = require('uuid');
//udp sockez
var dgram = require('dgram');
var s = dgram.createSocket('udp4');

class Musician { //a musician that plays a given instrument
   constructor(instrument, uuid) {

      this.instrument = instrument;
      this.uuid = uuid;

      Musician.prototype.update = function () { //function that will send the sound over udp
         var output = {
            uuid: this.uuid,
            sound: protocol[instrument]
         };
         var payload = JSON.stringify(output);

         var message = Buffer.from(payload);
         s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function (err, bytes) {
            console.log("Sending payload: " + payload + " via port " + s.address().port);
         });

      };

      setInterval(this.update.bind(this), 1000);

   }
}

var instrument = process.argv[2]; //get the assigned instrument
var uuid = uuidGenerator.v4(); //generate a new uuid

var m1 = new Musician(instrument, uuid);//Create the musician that will play on this process