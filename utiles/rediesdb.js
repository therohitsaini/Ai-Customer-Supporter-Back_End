import { createClient } from 'redis';
 export const client = createClient({
   url: 'redis://localhost:6379' // Change if using remote Redis
});
client.on('error', (err) => console.error('Redis Client Error', err));
await client.connect();
console.log('Connected to Redis');