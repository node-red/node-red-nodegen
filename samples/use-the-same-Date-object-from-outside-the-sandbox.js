// name: use the same Date object from outside the sandbox
// outputs: 1
msg.payload=global.get('typeTest')(new Date());
return msg;