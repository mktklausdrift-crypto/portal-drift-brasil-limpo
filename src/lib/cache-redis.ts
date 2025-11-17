import redis from './redis'

/**
 * Cache genérico com Redis
 * @param key - Chave do cache
 * @param ttl - Tempo de vida em segundos
 * @param fetcher - Função para buscar dados se não estiver em cache
 */
export async function cachedApiCall<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key)
    
    if (cached) {
      return JSON.parse(cached)
    }

    const data = await fetcher()
    await redis.setex(key, ttl, JSON.stringify(data))
    
    return data
  } catch (error) {
    console.error('Cache error, falling back to direct fetch:', error)
    return await fetcher()
  }
}

/**
 * Invalidar cache por chave específica
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Error invalidating cache:', error)
  }
}

/**
 * Invalidar múltiplas chaves por pattern
 */
export async function invalidateCacheByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Error invalidating cache by pattern:', error)
  }
}

/**
 * Cache de sessão
 */
export async function getCachedSession(sessionToken: string) {
  try {
    const cached = await redis.get(`session:${sessionToken}`)
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    console.error('Error getting cached session:', error)
    return null
  }
}

export async function setCachedSession(sessionToken: string, data: any, ttl: number = 3600) {
  try {
    await redis.setex(`session:${sessionToken}`, ttl, JSON.stringify(data))
  } catch (error) {
    console.error('Error setting cached session:', error)
  }
}

export async function invalidateSession(sessionToken: string) {
  try {
    await redis.del(`session:${sessionToken}`)
  } catch (error) {
    console.error('Error invalidating session:', error)
  }
}

/**
 * Rate limiting com Redis
 */
export async function rateLimit(
  identifier: string,
  limit: number = 100,
  window: number = 60
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  try {
    const key = `ratelimit:${identifier}`
    const current = await redis.incr(key)

    if (current === 1) {
      await redis.expire(key, window)
    }

    const ttl = await redis.ttl(key)
    const resetAt = Date.now() + (ttl * 1000)

    return {
      success: current <= limit,
      remaining: Math.max(0, limit - current),
      resetAt
    }
  } catch (error) {
    console.error('Error in rate limiting:', error)
    // Em caso de erro, permitir a requisição
    return {
      success: true,
      remaining: limit,
      resetAt: Date.now() + (window * 1000)
    }
  }
}

/**
 * Cache helpers específicos da aplicação
 */

// Cursos
export const CourseCache = {
  getAll: () => cachedApiCall('courses:all', 300, async () => null),
  getFeatured: () => cachedApiCall('courses:featured', 600, async () => null),
  getById: (id: string) => cachedApiCall(`course:${id}`, 600, async () => null),
  invalidate: async (id?: string) => {
    if (id) await invalidateCache(`course:${id}`)
    await invalidateCache('courses:all')
    await invalidateCache('courses:featured')
  }
}

// Produtos
export const ProductCache = {
  getAll: () => cachedApiCall('products:all', 300, async () => null),
  getFeatured: () => cachedApiCall('products:featured', 600, async () => null),
  getById: (id: string) => cachedApiCall(`product:${id}`, 600, async () => null),
  getByCategory: (category: string) => cachedApiCall(`products:category:${category}`, 300, async () => null),
  invalidate: async (id?: string) => {
    if (id) await invalidateCache(`product:${id}`)
    await invalidateCacheByPattern('products:*')
  }
}

// Usuários
export const UserCache = {
  getById: (id: string) => cachedApiCall(`user:${id}`, 600, async () => null),
  getRanking: () => cachedApiCall('users:ranking', 300, async () => null),
  invalidate: async (id?: string) => {
    if (id) await invalidateCache(`user:${id}`)
    await invalidateCache('users:ranking')
  }
}
