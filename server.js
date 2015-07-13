var snmp = require ("net-snmp");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var pdu_ip = "192.168.1.249";

app.get('/', function(req, res){
    res.sendfile('index.html');
});

app.get('/chart.js', function(req, res){
    res.sendfile('chart.js');
});

http.listen(7777);

var session = snmp.createSession (pdu_ip, "public");

var oids = ["1.3.6.1.4.1.318.1.1.26.6.3.1.7.1", "1.3.6.1.4.1.318.1.1.26.4.3.1.6.1", "1.3.6.1.4.1.318.1.1.26.4.3.1.7.1"];

setInterval(function() {
  var power = 0;
  session.get (oids, function (error, varbinds) {
    if (snmp.isVarbindError (varbinds[0])) {
        console.log (snmp.varbindError (varbinds[0]))
    }

    if (varbinds[0].value > 0) {
      io.emit('power', {
        power: varbinds[0].value,
        max: varbinds[2].value + " :: " + varbinds[1].value + "0"
      });
    }
  });

}, 2000);

session.trap (snmp.TrapType.LinkDown, function (error) {
    if (error)
      console.log(error);
});
