
const protocol = require('./orchestra-protocol');
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const moment = require('moment');

const activeMusicians = new Map();

const soundToInstrument = new Map();
soundToInstrument.set("ti-ta-ti", "piano");
soundToInstrument.set("pouet", "trumpet");
soundToInstrument.set("trulu", "flute");
soundToInstrument.set("gzi-gzi", "violin");
soundToInstrument.set("boum-boum", "drum");

const net = require('net');
const server = new net.Server(); 

socket.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

function auditory(msg, source)  {
  const input = JSON.parse(msg);
  if (soundToInstrument.has(input.sound) && input.uuid) {
      var infoMusician = activeMusicians.get(input.uuid);
      if (activeMusicians.has(input.uuid)) {
        infoMusician.lastPlayed = moment();
      } else {
        infoMusician = {instrument: soundToInstrument.get(input.sound), activeSince: moment(), lastPlayed: moment()};
      }
      activeMusicians.set(input.uuid, infoMusician);
      console.log("Data has arrived: " + msg + ". Source port: " + source.port);
  } else {
    console.log("Sound or uuid not recognized");
  }
}


function jsonMusiciansList() {
  var list = [];
  list.forEach(function (value, key) {
     list.push({ uuid: key, instrument: value.instrument, activeSince: value.activeSince.utcOffset(+120).format()});
  });
  return list;
}

function updateActiveMusician(musician, key, map) {
  var current = moment();
  if (current.subtract(5, 'seconds') > musician.lastPlayed) {
    map.delete(key);
  }
}

//UDP
socket.on('message', function(msg, source) {
	auditory(msg, source);
});

//TCP
server.listen(protocol.PROTOCOL_TCP_PORT, function() {
  console.log("Server listening for TCP connection requests");
});

server.on('connection', function (socket) {
  console.log('A new connection has been established.');

  var answer = jsonMusiciansList();
  socket.write(JSON.stringify(answer));

  socket.destroy();
});

setInterval(function(){ activeMusicians.forEach(updateActiveMusician)}, 500 );