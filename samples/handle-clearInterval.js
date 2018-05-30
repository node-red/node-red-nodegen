// name: handle clearInterval
// outputs: 1
var id=setInterval(null,100);
setTimeout(function(){clearInterval(id);node.send(msg);},1000);