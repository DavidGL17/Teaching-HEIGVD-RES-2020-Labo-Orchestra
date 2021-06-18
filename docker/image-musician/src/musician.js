var protocol = require('./protocol');

var dgram = require('dgram');

var uuidGenerator = require('uuid');

var s = dgram.createSocket('udp4');

class Musician {
   constructor(instrument, uuid) {

      this.instrument = instrument;
      this.uuid = uuid;

      Musician.prototype.update = function () {
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

var instrument = process.argv[2];
var uuid = uuidGenerator.v4();

var m1 = new Musician(instrument, uuid);