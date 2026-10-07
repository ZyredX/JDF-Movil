import tls from 'node:tls';

const socket = tls.connect(27017, 'ac-og61l6j-shard-00-00.tdzo98d.mongodb.net', { servername: 'ac-og61l6j-shard-00-00.tdzo98d.mongodb.net' }, () => {
  console.log('TLS handshake SUCCESSFUL!');
  console.log('Authorized:', socket.authorized);
  socket.end();
  process.exit(0);
});

socket.on('error', (err) => {
  console.error('TLS error:', err.message);
  process.exit(1);
});
