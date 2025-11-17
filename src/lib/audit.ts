// Sistema de Logs de Auditoria - Portal Klaus Drift Brasil
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuditLog } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Usa instância única de prisma (evita múltiplas conexões em dev)

// Tipos de eventos para auditoria
export enum AuditEventType {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  
  COURSE_CREATED = 'COURSE_CREATED',
  COURSE_UPDATED = 'COURSE_UPDATED',
  COURSE_DELETED = 'COURSE_DELETED',
  COURSE_COMPLETED = 'COURSE_COMPLETED',
  
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
  
  QUIZ_COMPLETED = 'QUIZ_COMPLETED',
  QUIZ_CREATED = 'QUIZ_CREATED',
  
  ADMIN_ACTION = 'ADMIN_ACTION',
  SECURITY_EVENT = 'SECURITY_EVENT',
  DATA_EXPORT = 'DATA_EXPORT',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG'
}

// Níveis de severidade
export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

interface AuditLogData {
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  entityId?: string;
  entityType?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  source?: string;
  message?: string;
}

class AuditLogger {
  private static instance: AuditLogger;
  private batchLogs: AuditLogData[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT = 5000; // 5 segundos

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  // Log individual
  async log(data: AuditLogData): Promise<void> {
    try {
      // Enriquecer dados com informações do sistema
      const enrichedData = {
        ...data,
        timestamp: new Date(),
        sessionId: this.generateSessionId(),
        environment: process.env.NODE_ENV,
        version: process.env.APP_VERSION || '2.0.0'
      };

      // Adicionar ao batch
      this.batchLogs.push(enrichedData);

      // Processar batch se atingiu o limite
      if (this.batchLogs.length >= this.BATCH_SIZE) {
        await this.processBatch();
      } else {
        // Definir timer para processar batch
        this.scheduleBatchProcessing();
      }

    } catch (error) {
      console.error('❌ Erro ao registrar log de auditoria:', error);
      // Em caso de erro, tentar salvar diretamente
      this.saveDirectly(data);
    }
  }

  // Processar logs em batch
  private async processBatch(): Promise<void> {
    if (this.batchLogs.length === 0) return;

    const logsToProcess = [...this.batchLogs];
    this.batchLogs = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      await this.saveBatch(logsToProcess);
      console.log(`✅ Salvos ${logsToProcess.length} logs de auditoria`);
    } catch (error) {
      console.error('❌ Erro ao salvar batch de logs:', error);
      // Retornar logs ao batch para nova tentativa
      this.batchLogs.unshift(...logsToProcess);
    }
  }

  // Agendar processamento do batch
  private scheduleBatchProcessing(): void {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(async () => {
      await this.processBatch();
    }, this.BATCH_TIMEOUT);
  }

  // Salvar batch no banco
  private async saveBatch(logs: AuditLogData[]): Promise<void> {
    const auditEntries = logs.map(log => ({
      eventType: log.eventType,
      severity: log.severity,
      userId: log.userId,
      userEmail: log.userEmail,
      entityId: log.entityId,
      entityType: log.entityType,
      oldValues: log.oldValues ? JSON.stringify(log.oldValues) : null,
      newValues: log.newValues ? JSON.stringify(log.newValues) : null,
      metadata: log.metadata ? JSON.stringify(log.metadata) : null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      source: log.source || 'SYSTEM',
      message: log.message,
      createdAt: new Date()
    }));

    // Use createMany if available, otherwise fallback to individual creates
    if (prisma?.auditLog?.createMany) {
      await prisma.auditLog.createMany({ data: auditEntries });
    } else {
      for (const entry of auditEntries) {
        try {
          await prisma.auditLog?.create?.({ data: entry });
        } catch (_) {
          // ignore individual failures in fallback mode
        }
      }
    }
  }

  // Salvar diretamente (fallback)
  private async saveDirectly(data: AuditLogData): Promise<void> {
    try {
      if (prisma?.auditLog?.create) {
        await prisma.auditLog.create({
          data: {
            eventType: data.eventType,
            severity: data.severity,
            userId: data.userId,
            userEmail: data.userEmail ?? undefined,
            entityId: data.entityId,
            entityType: data.entityType,
            oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
            newValues: data.newValues ? JSON.stringify(data.newValues) : null,
            metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            source: data.source || 'SYSTEM',
            message: data.message,
            createdAt: new Date()
          }
        });
      }
    } catch (err) {
      const e = err as Error;
      console.error('❌ Falha crítica ao salvar log:', e.message || e);
    }
  }

  // Gerar ID de sessão único
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Forçar processamento de todos os logs pendentes
  async flush(): Promise<void> {
    await this.processBatch();
  }
}

// Instância singleton
export const auditLogger = AuditLogger.getInstance();

// Utilitários para facilitar o uso
export async function logUserAction(
  eventType: AuditEventType,
  request: NextRequest,
  additionalData?: Partial<AuditLogData>
): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await auditLogger.log({
      eventType,
      severity: AuditSeverity.INFO,
      userId: session?.user?.id,
      userEmail: (session?.user?.email ?? undefined) as string | undefined,
      ipAddress,
      userAgent,
      source: 'WEB_APP',
      ...additionalData
    });
  } catch (error) {
    console.error('❌ Erro ao registrar ação do usuário:', error);
  }
}

export async function logSecurityEvent(
  message: string,
  severity: AuditSeverity,
  request?: NextRequest,
  metadata?: Record<string, any>
): Promise<void> {
  const ipAddress = request?.headers.get('x-forwarded-for') || 
                   request?.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request?.headers.get('user-agent') || 'unknown';

  await auditLogger.log({
    eventType: AuditEventType.SECURITY_EVENT,
    severity,
    message,
    ipAddress,
    userAgent,
    metadata,
    source: 'SECURITY_SYSTEM'
  });
}

export async function logSystemEvent(
  eventType: AuditEventType,
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  await auditLogger.log({
    eventType,
    severity: AuditSeverity.INFO,
    message,
    metadata,
    source: 'SYSTEM'
  });
}

export async function logDataChange(
  eventType: AuditEventType,
  entityType: string,
  entityId: string,
  oldValues: Record<string, any>,
  newValues: Record<string, any>,
  request?: NextRequest
): Promise<void> {
  const session = request ? await getServerSession(authOptions) : null;
  const ipAddress = request?.headers.get('x-forwarded-for') || 'system';
  
  await auditLogger.log({
    eventType,
    severity: AuditSeverity.INFO,
    userId: session?.user?.id,
    userEmail: (session?.user?.email ?? undefined) as string | undefined,
    entityType,
    entityId,
    oldValues,
    newValues,
    ipAddress,
    source: 'DATA_CHANGE'
  });
}

// API para consultar logs de auditoria
export async function getAuditLogs(
  filters: {
    userId?: string;
    eventType?: AuditEventType;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {}
) {
  const {
    userId,
    eventType,
    severity,
    startDate,
    endDate,
    page = 1,
    limit = 50
  } = filters;

  const where: any = {};

  if (userId) where.userId = userId;
  if (eventType) where.eventType = eventType;
  if (severity) where.severity = severity;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    }),
    prisma.auditLog.count({ where })
  ]);

  return {
    logs: (logs as AuditLog[]).map((log) => ({
      ...log,
      oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
      newValues: log.newValues ? JSON.parse(log.newValues) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

// Cleanup de logs antigos (executar em cron job)
export async function cleanupOldLogs(daysToKeep: number = 90): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const deleted = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate
      },
      severity: {
        not: AuditSeverity.CRITICAL // Manter logs críticos por mais tempo
      }
    }
  });

  console.log(`🧹 Removidos ${deleted.count} logs de auditoria antigos`);
}

// Middleware para auditoria automática
export function withAudit(eventType: AuditEventType) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const request = args.find(arg => arg && arg.headers && arg.url);
      
      try {
        const result = await method.apply(this, args);
        
        if (request) {
          await logUserAction(eventType, request, {
            message: `${propertyName} executado com sucesso`,
            metadata: { method: propertyName, args: args.length }
          });
        }
        
        return result;
      } catch (error) {
        if (request) {
            const err = error as Error;
            await logUserAction(eventType, request, {
              severity: AuditSeverity.ERROR,
              message: `Erro em ${propertyName}: ${err.message}`,
              metadata: { method: propertyName, error: err.message }
            });
          }
          throw error;
      }
    };

    return descriptor;
  };
}

export default auditLogger;