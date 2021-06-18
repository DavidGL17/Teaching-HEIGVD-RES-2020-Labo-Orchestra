//Packages
const protocol = require('./protocol');
//tcp server
const net = require('net');
const server = new net.Server();
//time managment
const moment = require('moment');
//udp listener
const dgram = require('dgram');
const s = dgram.createSocket('udp4');

//active musician map and sound map
var musicians = new Map();
const soundToInstrument = new Map();
soundToInstrument.set("ti-ta-ti", "piano");
soundToInstrument.set("pouet", "trumpet");
soundToInstrument.set("trulu", "flute");
soundToInstrument.set("gzi-gzi", "violin");
soundToInstrument.set("boum-boum", "drum");


//function to add a musician
function udpMessageHandler(msg, source) {
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

//udp handling
s.bind(protocol.PROTOCOL_PORT, function () {
   console.log("Joining multicast group");
   s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

s.on('message', function (msg, source) {
   udpMessageHandler(msg, source);
});

//tcp handling
server.listen(2205, function () {
   console.log("Server listening for TCP connection requests on port 2205");
});

server.on('connection', function (socket) {
   console.log('A new TCP connection has been established.');

   var musicianPlayingTab = getMusicians();
   socket.write(JSON.stringify(musicianPlayingTab));

   socket.destroy();
});

//refresh map to delete inactive musicians
setInterval(function () {
   musicians.forEach(function (value, key, map) {
      var now = moment();
      if (now.subtract(5, 'seconds') > value.lastContact) { //If last contact older than 5 sec
         map.delete(key);
         console.log("Deleted musician " + key + " for inactivity");
      }
   });
}, 500);