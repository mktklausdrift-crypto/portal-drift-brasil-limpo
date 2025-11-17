// Sistema de Cache Avançado - Portal Klaus Drift Brasil
import { NextRequest, NextResponse } from 'next/server';

interface CacheConfig {
  ttl?: number; // Time to live em segundos
  tags?: string[]; // Tags para invalidação
  revalidate?: number; // Revalidação automática
}

interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  etag: string;
}

class AdvancedCache {
  private cache = new Map<string, CacheItem>();
  private defaultTTL = 300; // 5 minutos

  // Gerar ETag para cache
  private generateETag(data: any): string {
    const hash = JSON.stringify(data);
    return Buffer.from(hash).toString('base64').substring(0, 12);
  }

  // Verificar se item está válido
  private isValid(item: CacheItem): boolean {
    const now = Date.now();
    return (now - item.timestamp) < (item.ttl * 1000);
  }

  // Definir item no cache
  set<T>(key: string, data: T, config: CacheConfig = {}): void {
    const ttl = config.ttl || this.defaultTTL;
    const tags = config.tags || [];
    
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
      etag: this.generateETag(data)
    };

    this.cache.set(key, item);
  }

  // Obter item do cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (!this.isValid(item)) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // Verificar se existe no cache
  has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? this.isValid(item) : false;
  }

  // Invalidar por tag
  invalidateByTag(tag: string): void {
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  // Limpar cache expirado
  cleanup(): void {
    for (const [key, item] of this.cache.entries()) {
      if (!this.isValid(item)) {
        this.cache.delete(key);
      }
    }
  }

  // Obter estatísticas do cache
  getStats() {
    const totalItems = this.cache.size;
    const validItems = Array.from(this.cache.values()).filter(item => this.isValid(item)).length;
    
    return {
      total: totalItems,
      valid: validItems,
      expired: totalItems - validItems,
      size: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }

  // Método para API Routes com headers de cache
  async withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig = {},
    request?: NextRequest
  ): Promise<{ data: T; response?: NextResponse }> {
    // Verificar ETag do cliente
    const clientETag = request?.headers.get('if-none-match');
    const cached = this.cache.get(key);
    
    if (cached && this.isValid(cached)) {
      if (clientETag && clientETag === cached.etag) {
        return {
          data: cached.data,
          response: new NextResponse(null, { status: 304 })
        };
      }
      
      return {
        data: cached.data,
        response: NextResponse.json(cached.data, {
          headers: {
            'ETag': cached.etag,
            'Cache-Control': `public, max-age=${cached.ttl}`,
            'X-Cache': 'HIT'
          }
        })
      };
    }

    // Buscar dados novos
    const data = await fetcher();
    this.set(key, data, config);
    
    const newItem = this.cache.get(key)!;
    return {
      data,
      response: NextResponse.json(data, {
        headers: {
          'ETag': newItem.etag,
          'Cache-Control': `public, max-age=${newItem.ttl}`,
          'X-Cache': 'MISS'
        }
      })
    };
  }
}

// Instância global do cache
export const cache = new AdvancedCache();

// Middleware para limpeza automática
setInterval(() => {
  cache.cleanup();
}, 60000); // Limpar a cada minuto

// Configurações predefinidas
export const cacheConfigs = {
  // Dados estáticos (24 horas)
  static: { ttl: 86400, tags: ['static'] },
  
  // Dados de usuário (5 minutos)
  user: { ttl: 300, tags: ['user'] },
  
  // Catálogo de peças (1 hora)
  catalog: { ttl: 3600, tags: ['catalog', 'products'] },
  
  // Cursos (30 minutos)
  courses: { ttl: 1800, tags: ['courses', 'education'] },
  
  // Analytics (15 minutos)
  analytics: { ttl: 900, tags: ['analytics', 'stats'] },
  
  // Configurações do sistema (1 hora)
  settings: { ttl: 3600, tags: ['settings', 'config'] }
};

// Utilitários para chaves de cache
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:profile:${id}`,
  userCourses: (id: string) => `user:courses:${id}`,
  
  course: (id: string) => `course:${id}`,
  courseModules: (courseId: string) => `course:modules:${courseId}`,
  courseProgress: (userId: string, courseId: string) => `progress:${userId}:${courseId}`,
  
  product: (id: string) => `product:${id}`,
  productsByCategory: (category: string) => `products:category:${category}`,
  featuredProducts: () => 'products:featured',
  
  analytics: (type: string, period: string) => `analytics:${type}:${period}`,
  dashboardStats: (userId: string) => `dashboard:stats:${userId}`,
  
  quiz: (id: string) => `quiz:${id}`,
  quizResults: (userId: string, quizId: string) => `quiz:results:${userId}:${quizId}`
};

// Hook personalizado para React components
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig = {}
) {
  const data = cache.get<T>(key);
  
  if (!data) {
    // Buscar dados de forma assíncrona
    fetcher().then(result => {
      cache.set(key, result, config);
    });
  }
  
  return data;
}

export default cache;