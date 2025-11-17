// Middleware de Performance Monitoring - Portal Klaus Drift Brasil
// Versão sem Sentry - logs estruturados apenas

import { NextRequest, NextResponse } from 'next/server';

interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsage: NodeJS.MemoryUsage;
  requestSize: number;
  responseSize: number;
}

interface RequestContext {
  method: string;
  url: string;
  userAgent: string;
  ip: string;
  userId?: string;
  sessionId?: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metricsBuffer: PerformanceMetrics[] = [];
  private readonly BUFFER_SIZE = 100;
  private readonly SLOW_REQUEST_THRESHOLD = 5000; // 5 segundos

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async trackRequest(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    // Extrair contexto da requisição
    const context: RequestContext = {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: this.getClientIP(request),
    };

    // Calcular tamanho da requisição
    const requestSize = this.calculateRequestSize(request);

    try {
      // Executar handler
      const response = await handler();
      
      // Calcular métricas
      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      const duration = endTime - startTime;
      
      const metrics: PerformanceMetrics = {
        startTime,
        endTime,
        duration,
        memoryUsage: endMemory,
        requestSize,
        responseSize: this.calculateResponseSize(response),
      };

      // Adicionar métricas ao buffer
      this.addMetrics(metrics);

      // Log e alertas baseados em performance
      await this.handlePerformanceAlert(context, metrics, response.status);

      // Adicionar headers de performance para debug
      if (process.env.NODE_ENV === 'development') {
        response.headers.set('X-Response-Time', `${duration}ms`);
        response.headers.set('X-Memory-Usage', `${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`);
      }

      return response;

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Capturar erro no Sentry com contexto
      await this.captureError(error as Error, context, duration);

      throw error;
    }
  }

  private getClientIP(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'
    );
  }

  private calculateRequestSize(request: NextRequest): number {
    const contentLength = request.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : 0;
  }

  private calculateResponseSize(response: NextResponse): number {
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : 0;
  }

  private addMetrics(metrics: PerformanceMetrics): void {
    this.metricsBuffer.push(metrics);
    
    // Manter buffer limitado
    if (this.metricsBuffer.length > this.BUFFER_SIZE) {
      this.metricsBuffer.shift();
    }
  }

  private async handlePerformanceAlert(
    context: RequestContext,
    metrics: PerformanceMetrics,
    statusCode: number
  ): Promise<void> {
    // Alert para requisições lentas
    if (metrics.duration > this.SLOW_REQUEST_THRESHOLD) {
      await this.captureSlowRequest(context, metrics);
    }

    // Alert para uso alto de memória
    if (metrics.memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
      await this.captureHighMemoryUsage(context, metrics);
    }

    // Alert para erros HTTP
    if (statusCode >= 500) {
      await this.captureServerError(context, metrics, statusCode);
    }

    // Log estruturado para analytics
    this.logPerformanceMetrics(context, metrics, statusCode);
  }

  private async captureSlowRequest(
    context: RequestContext,
    metrics: PerformanceMetrics
  ): Promise<void> {
    console.warn(`🚨 Slow request detected: ${metrics.duration}ms`, {
      context,
      metrics
    });
  }

  private async captureHighMemoryUsage(
    context: RequestContext,
    metrics: PerformanceMetrics
  ): Promise<void> {
    const memoryMB = Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024);
    console.warn(`🚨 High memory usage detected: ${memoryMB}MB`, {
      context,
      memory: metrics.memoryUsage
    });
  }

  private async captureServerError(
    context: RequestContext,
    metrics: PerformanceMetrics,
    statusCode: number
  ): Promise<void> {
    console.error(`🚨 Server error: ${statusCode}`, {
      context,
      metrics
    });
  }

  private async captureError(
    error: Error,
    context: RequestContext,
    duration: number
  ): Promise<void> {
    console.error(`🚨 Request handler error:`, {
      error: error.message,
      stack: error.stack,
      context,
      duration
    });
  }

  private logPerformanceMetrics(
    context: RequestContext,
    metrics: PerformanceMetrics,
    statusCode: number
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      method: context.method,
      url: context.url,
      statusCode,
      duration: metrics.duration,
      memoryUsage: Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024),
      requestSize: metrics.requestSize,
      responseSize: metrics.responseSize,
      userAgent: context.userAgent,
      ip: context.ip,
    };

    // Em produção, enviar para sistema de logs estruturados
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logData));
    } else {
      console.log('📊 Performance:', logData);
    }
  }

  // Obter estatísticas do buffer
  getMetricsStats(): {
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
    totalRequests: number;
    avgMemoryUsage: number;
  } {
    if (this.metricsBuffer.length === 0) {
      return {
        avgDuration: 0,
        maxDuration: 0,
        minDuration: 0,
        totalRequests: 0,
        avgMemoryUsage: 0,
      };
    }

    const durations = this.metricsBuffer.map(m => m.duration);
    const memoryUsages = this.metricsBuffer.map(m => m.memoryUsage.heapUsed);

    return {
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      totalRequests: this.metricsBuffer.length,
      avgMemoryUsage: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
    };
  }

  // Limpar buffer (para testes)
  clearMetrics(): void {
    this.metricsBuffer = [];
  }
}

// Instância singleton
export const performanceMonitor = PerformanceMonitor.getInstance();

// Middleware wrapper para uso fácil
export function withPerformanceMonitoring(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    return performanceMonitor.trackRequest(request, () => handler(request));
  };
}

export default performanceMonitor;