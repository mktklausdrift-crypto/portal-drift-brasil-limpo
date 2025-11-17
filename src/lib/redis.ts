import { Redis } from 'ioredis'

declare global {
  var redis: Redis | undefined
}

const globalForRedis = global as unknown as { redis: Redis }

export const redis =
  globalForRedis.redis ||
  new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: 0,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    connectTimeout: 10000,
  })

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Graceful shutdown
process.on('beforeExit', async () => {
  await redis.quit()
})

// Health check
redis.on('ready', () => {
  console.log('✅ Redis connected successfully')
})

redis.on('error', (err: Error) => {
  console.error('❌ Redis connection error:', err)
})

export default redis
