// Sistema de Logs Estruturados - Portal Klaus Drift Brasil
// Winston logger com múltiplos transports

import winston from 'winston';
import path from 'path';

// Definir níveis de log customizados
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Adicionar cores aos níveis
winston.addColors(logColors);

// Formato para console (desenvolvimento)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = ` ${JSON.stringify(meta)}`;
    }
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// Formato para arquivo (produção)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configurar transports
const transports: winston.transport[] = [];

// Console transport (sempre ativo em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat,
    })
  );
}

// File transports (produção e desenvolvimento)
const logsDir = path.join(process.cwd(), 'logs');

// Log de aplicação geral
transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    level: 'info',
    format: fileFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
  })
);

// Log de erros
transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
  })
);

// Log de auditoria (apenas warnings e erros críticos)
transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, 'audit.log'),
    level: 'warn',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          service: 'klaus-drift-brasil',
          version: process.env.APP_VERSION || '2.0.0',
          environment: process.env.NODE_ENV,
          ...meta
        });
      })
    ),
    maxsize: 50 * 1024 * 1024, // 50MB
    maxFiles: 20,
  })
);

// Logger configurado sem Sentry (temporariamente desabilitado)
// Para reabilitar: instalar @sentry/winston e configurar SENTRY_DSN
// transports.push(new SentryWinston.SentryTransport({ ... }))

// Criar logger principal
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: fileFormat,
  defaultMeta: {
    service: 'klaus-drift-brasil',
    version: process.env.APP_VERSION || '2.0.0',
    environment: process.env.NODE_ENV,
  },
  transports,
  exitOnError: false,
});

// Middleware para capturar logs não tratados
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: fileFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    })
  );
  
  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: fileFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    })
  );
}

// Utilitários de logging específicos
export const logRequest = (req: any, res: any, responseTime: number) => {
  const logData = {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    userId: req.user?.id,
  };
  
  if (res.statusCode >= 400) {
    logger.warn('HTTP Request Error', logData);
  } else {
    logger.http('HTTP Request', logData);
  }
};

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error(error.message, {
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

export const logUserAction = (action: string, userId: string, details?: Record<string, any>) => {
  logger.info('User Action', {
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

export const logSecurityEvent = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', details?: Record<string, any>) => {
  const logLevel = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info';
  
  logger.log(logLevel, 'Security Event', {
    event,
    severity,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

export const logPerformance = (operation: string, duration: number, details?: Record<string, any>) => {
  logger.info('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

export const logSystemEvent = (event: string, details?: Record<string, any>) => {
  logger.info('System Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Função para limpar logs antigos (usar em cron job)
export const cleanupLogs = async (daysToKeep: number = 30) => {
  const fs = require('fs').promises;
  const logsDir = path.join(process.cwd(), 'logs');
  
  try {
    const files = await fs.readdir(logsDir);
    const now = Date.now();
    const cutoffTime = now - (daysToKeep * 24 * 60 * 60 * 1000);
    
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime.getTime() < cutoffTime) {
        await fs.unlink(filePath);
        logger.info('Log file cleaned up', { file, age: now - stats.mtime.getTime() });
      }
    }
  } catch (error) {
    logger.error('Failed to cleanup logs', { error: error.message });
  }
};

export default logger;