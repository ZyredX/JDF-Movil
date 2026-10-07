import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

try {
  await client.connect();
  console.log('MongoDB connected successfully!');
  const dbs = await client.db().admin().listDatabases();
  console.log('DBS:', dbs);
  await client.close();
} catch (e) {
  console.log('Error message:', e.message);
  if (e.topology) {
    for (const [address, server] of e.topology.s.servers) {
      console.log('Server:', address, 'Error:', server.s.error ? server.s.error.message : 'No specific error');
    }
  }
}
