var protocol = require('./protocol');

var dgram = require('dgram');

var uuidGenerator = require('uuid');

var s = dgram.createSocket('udp4');

class Musician {
   constructor(instrumentId, uuid, dateOfActivity) {

      this.instrumentId = instrumentId;
      this.uuid = uuid;
      this.dateOfActivity = dateOfActivity;

      Musician.prototype.update = function () {
         var measure = {
            uuid: this.uuid,
            instrument: protocol.INSTRUMENTS_AVAILABLE[this.instrumentId].instrument,
            activeSince: this.dateOfActivity
         };
         var payload = JSON.stringify(measure);

         var message = Buffer.from(payload);
         s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function (err, bytes) {
            console.log("Sending payload: " + payload + " via port " + s.address().port);
         });

      };

      setInterval(this.update.bind(this), 500);

   }
}

var instrumentId = Math.floor(Math.random() * 5);
var uuid = uuidGenerator.v4();
var date = Date.now();

var m1 = new Musician(instrumentId, uuid, date);