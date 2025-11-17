// Caminho: src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Declara uma variável global para armazenar a instância do Prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Cria a instância do Prisma.
// Se já existir uma na variável global (em ambiente de desenvolvimento), reutiliza.
// Se não, cria uma nova.
const prisma = globalThis.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Em ambiente de desenvolvimento, salva a instância na variável global.
// Isso evita criar novas conexões a cada recarregamento de página (hot reload).
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Exporta a instância única por padrão (export default).
export default prisma;