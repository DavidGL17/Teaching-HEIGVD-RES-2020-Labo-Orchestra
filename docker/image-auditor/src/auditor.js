
const protocol = require('./protocol');

const dgram = require('dgram');

const s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, function () {
   console.log("Joining multicast group");
   s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

s.on('message', function (msg, source) {
   //TODO ?
   console.log("Data has arrived: " + msg + ". Source port: " + source.port);
});
