import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    tls: process.env.REDIS_URL ? true : false,
  },
});

client.on('error', (err) => console.error('❌ Redis Client Error', err));

client.on('connect', () => console.log('✅ Redis connected'));

export const redisDbConnected = async () => {
  await client.connect();
};

export default client;