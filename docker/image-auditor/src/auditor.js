//Variables
const protocol = require('./protocol');

const dgram = require('dgram');

const s = dgram.createSocket('udp4');

var musicians = new Map();

var express = require('express');
var app = express();

//get instrument from sound
function getInstrumentFromSound(sound) {
   switch (sound) {
      case protocol.piano:
         return "piano";
      case protocol.drum:
         return "drum";
      case protocol.flute:
         return "flute";
      case protocol.trumpet:
         return "trumpet";
      case protocol.violin:
         return "violin";
      default:
         return null;
   }
}

//function to add a musician
function udpHandler(msg, source) {
   var instrument = getInstrumentFromSound(msg.sound);
   if (instrument == null) {
      console.log("Error, sound is not correct");
      return;
   }
   console.log("Message arrived : " + msg + " from : " + source);
   var musician = musicians.get(msg.uuid);
   if (!musician) {
      musicians.set(msg.uuid, { lastContact: new Date(), instrument: instrument, activeSince: new Date() });
   } else {
      musician.lastContact = new Date();
      musicians.set(msg.uuid, musician);
   }
}

//function to get all musicians in map
function getMusicians() {
   var list = [];
   list.forEach((value, key, map) => {
      list.push({ uuid: key, instrument: value.instrument, activeSince: value.activeSince });
   });
   return list;
}

//udp
s.bind(protocol.PROTOCOL_PORT, function () {
   console.log("Joining multicast group");
   s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

s.on('message', function (msg, source) {
   udpHandler(msg, source);
});

//tcp
app.get('/', function (req, res) {
   res.send(getMusicians());
});

app.listen(3000, function () {
   console.log('Accepting HTTP requests on port 3000.');
});