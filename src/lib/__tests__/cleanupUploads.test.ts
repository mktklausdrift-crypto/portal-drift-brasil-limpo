import { cleanupUploads } from '@/lib/cleanupUploads'

// Mocks
jest.mock('fs/promises', () => ({
  __esModule: true,
  default: {
    readdir: jest.fn(),
    stat: jest.fn(),
    unlink: jest.fn(),
  },
}))

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    aulaMaterial: {
      findMany: jest.fn(),
    },
  },
}))

const fs = require('fs/promises').default as jest.Mocked<any>
const prisma = require('@/lib/prisma').default as jest.Mocked<any>

describe('cleanupUploads', () => {
  const baseDir = 'C:/fake/uploads'

  beforeEach(() => {
    jest.resetAllMocks()
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01T00:00:00Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('returns empty report when directory does not exist', async () => {
    fs.readdir.mockRejectedValueOnce(new Error('ENOENT'))

    const report = await cleanupUploads(baseDir, 30)
    expect(report.checked).toBe(0)
    expect(report.inDatabase).toBe(0)
    expect(report.removed).toEqual([])
    expect(report.kept).toEqual([])
  })

  it('keeps referenced files and removes old unreferenced files', async () => {
    // Files in directory
    const files = ['a.pdf', 'b.docx', 'c.zip']
    fs.readdir.mockResolvedValueOnce(files)

    // Prisma says 'b.docx' is referenced
    prisma.aulaMaterial.findMany.mockResolvedValueOnce([
      { fileName: 'b.docx' },
    ])

    // Stat times: a.pdf old, b.docx any, c.zip new (too young)
    const now = Date.now()
    const oldMs = now - 60 * 60 * 1000 // 60 minutes ago
    const youngMs = now - 5 * 60 * 1000 // 5 minutes ago

    fs.stat.mockImplementation(async (fullPath: string) => {
      if (fullPath.endsWith('a.pdf')) return { mtimeMs: oldMs }
      if (fullPath.endsWith('b.docx')) return { mtimeMs: oldMs }
      if (fullPath.endsWith('c.zip')) return { mtimeMs: youngMs }
      throw new Error('unexpected stat path')
    })

    const unlinked: string[] = []
    fs.unlink.mockImplementation(async (fullPath: string) => {
      unlinked.push(fullPath)
    })

    const report = await cleanupUploads(baseDir, 30)

    expect(report.checked).toBe(3)
    expect(report.inDatabase).toBe(1)
    // a.pdf should be removed (old and not referenced)
    expect(report.removed).toContain('a.pdf')
    // c.zip should be kept (too young)
    expect(report.kept).toContain('c.zip')
    // b.docx should be kept (referenced)
    expect(report.kept).toContain('b.docx')
    // Ensure unlink called for a.pdf only
    expect(unlinked.length).toBe(1)
    expect(unlinked[0]).toMatch(/a\.pdf$/)
  })

  it('keeps files when fs operations fail gracefully', async () => {
    fs.readdir.mockResolvedValueOnce(['err.bin'])
    prisma.aulaMaterial.findMany.mockResolvedValueOnce([])
    fs.stat.mockRejectedValueOnce(new Error('EACCES'))

    const report = await cleanupUploads(baseDir, 30)
    expect(report.checked).toBe(1)
    expect(report.removed).toEqual([])
    expect(report.kept).toEqual(['err.bin'])
  })
})
