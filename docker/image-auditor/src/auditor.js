//Variables
const protocol = require('./protocol');

const dgram = require('dgram');
const s = dgram.createSocket('udp4');

var musicians = new Map();
const soundToInstrument = new Map();
soundToInstrument.set("ti-ta-ti", "piano");
soundToInstrument.set("pouet", "trumpet");
soundToInstrument.set("trulu", "flute");
soundToInstrument.set("gzi-gzi", "violin");
soundToInstrument.set("boum-boum", "drum");

const net = require('net');
const server = new net.Server();

const moment = require('moment');

//function to add a musician
function udpHandler(msg, source) {
   jsonData = JSON.parse(msg);
   if (soundToInstrument.has(jsonData.sound) && jsonData.uuid) {
      console.log("Message arrived : " + msg + " from : " + source);
      if (!musicians.has(jsonData.uuid)) {
         musicians.set(jsonData.uuid, { lastContact: moment(), instrument: soundToInstrument.get(jsonData.sound), activeSince: moment() });
      } else {
         var musician = musicians.get(jsonData.uuid);
         musician.lastContact = moment();
         musicians.set(jsonData.uuid, musician);
      }
   } else {
      console.log("Received invalid data");
   }
}

//function to get all musicians in map
function getMusicians() {
   var list = [];
   musicians.forEach(function (value, key) {
      list.push({ uuid: key, instrument: value.instrument, activeSince: value.activeSince.utcOffset(+120).format() });
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
server.listen(2205, function () {
   console.log("Server listening for TCP connection requests on port 2205");
});

server.on('connection', function (socket) {
   console.log('A new TCP connection has been established.');

   /* generate json content for TCP client */
   var musicianAlive = getMusicians();
   socket.write(JSON.stringify(musicianAlive));

   /* We destroy the socket, that close the connection for the client */
   socket.destroy();
});

//refresh map

setInterval(function () {
   musicians.forEach(function (value, key, map) {
      var now = moment();
      if (now.subtract(5, 'seconds') > value.lastContact) { //If last contact older than 5 sec
         map.delete(key);
         console.log("Deleted musician " + key + " for inactivity");
      }
   });
}, 500);