import fs from 'fs/promises'
import path from 'path'
import prisma from '@/lib/prisma'

export interface CleanupReport {
  baseDir: string
  checked: number
  inDatabase: number
  removed: string[]
  kept: string[]
}

const DEFAULT_BASE = path.join(process.cwd(), 'public', 'uploads', 'files')

export async function cleanupUploads(baseDir: string = DEFAULT_BASE, minAgeMinutes = 30): Promise<CleanupReport> {
  const now = Date.now()
  const minAgeMs = minAgeMinutes * 60 * 1000
  const removed: string[] = []
  const kept: string[] = []

  // listar arquivos no diretório
  let entries: string[] = []
  try {
    entries = await fs.readdir(baseDir)
  } catch (e) {
    // diretório pode não existir ainda
    return { baseDir, checked: 0, inDatabase: 0, removed, kept }
  }

  if (entries.length === 0) {
    return { baseDir, checked: 0, inDatabase: 0, removed, kept }
  }

  // buscar todos fileNames no banco
  const dbMaterials = await prisma.aulaMaterial.findMany({ select: { fileName: true } })
  const dbSet = new Set<string>(dbMaterials.map((m: any) => m.fileName))

  let inDatabase = 0

  for (const fileName of entries) {
    // ignorar pastas / nomes suspeitos
    if (fileName.includes('/') || fileName.includes('..')) continue

    const full = path.join(baseDir, fileName)
    try {
      const stat = await fs.stat(full)
      const age = now - stat.mtimeMs

      if (dbSet.has(fileName)) {
        inDatabase++
        kept.push(fileName)
        continue
      }

      // heurística de segurança de tempo
      if (age < minAgeMs) {
        kept.push(fileName)
        continue
      }

      await fs.unlink(full)
      removed.push(fileName)
    } catch (e) {
      // se não conseguir ler/remover, manter para revisão
      kept.push(fileName)
    }
  }

  return { baseDir, checked: entries.length, inDatabase, removed, kept }
}
