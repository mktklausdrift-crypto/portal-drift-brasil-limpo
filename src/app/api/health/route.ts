// API Route: Health Check - Portal Klaus Drift Brasil
// Endpoint para verificação de saúde da aplicação

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: 'healthy' | 'unhealthy';
    cache: 'healthy' | 'unhealthy';
    auth: 'healthy' | 'unhealthy';
  };
  metrics: {
    memoryUsage: NodeJS.MemoryUsage;
    responseTime: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Verificar banco de dados
    const dbStatus = await checkDatabase();
    
    // Verificar cache (Redis seria aqui)
    const cacheStatus = await checkCache();
    
    // Verificar auth (basic check)
    const authStatus = await checkAuth();
    
    // Calcular tempo de resposta
    const responseTime = Date.now() - startTime;
    
    // Determinar status geral
    const services = {
      database: dbStatus,
      cache: cacheStatus,
      auth: authStatus
    };
    
    const hasUnhealthy = Object.values(services).includes('unhealthy');
    const overallStatus: HealthStatus['status'] = hasUnhealthy ? 'degraded' : 'healthy';
    
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
      metrics: {
        memoryUsage: process.memoryUsage(),
        responseTime
      }
    };
    
    // Status code baseado na saúde
    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthStatus, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const unhealthyStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'unhealthy',
        cache: 'unhealthy',
        auth: 'unhealthy'
      },
      metrics: {
        memoryUsage: process.memoryUsage(),
        responseTime: Date.now() - startTime
      }
    };
    
    return NextResponse.json(unhealthyStatus, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
}

async function checkDatabase(): Promise<'healthy' | 'unhealthy'> {
  try {
    // Tentar uma query simples
    await prisma.$queryRaw`SELECT 1`;
    return 'healthy';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'unhealthy';
  }
}

async function checkCache(): Promise<'healthy' | 'unhealthy'> {
  try {
    // Se Redis estiver configurado, testar aqui
    // Por enquanto, sempre healthy
    return 'healthy';
  } catch (error) {
    console.error('Cache health check failed:', error);
    return 'unhealthy';
  }
}

async function checkAuth(): Promise<'healthy' | 'unhealthy'> {
  try {
    // Verificar se as variáveis de auth estão configuradas
    if (!process.env.NEXTAUTH_SECRET) {
      return 'unhealthy';
    }
    return 'healthy';
  } catch (error) {
    console.error('Auth health check failed:', error);
    return 'unhealthy';
  }
}

// Endpoint simplificado para load balancers
export async function HEAD(): Promise<NextResponse> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    return new NextResponse('Unhealthy', { status: 503 });
  }
}