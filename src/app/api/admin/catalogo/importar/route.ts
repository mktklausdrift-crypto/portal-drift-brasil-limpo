import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import prisma from "@/lib/prisma"
import * as ExcelJS from 'exceljs'
import JSZip from 'jszip'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface ParsedRow {
  valid: boolean
  data: any
  error?: string
}

/**
 * POST /api/admin/catalogo/importar
 * Importa dados em massa via Excel/CSV
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const isPreview = formData.get('preview') === 'true'
    const imagesZip = formData.get('images') as File | null

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não fornecido" },
        { status: 400 }
      )
    }

    // Ler arquivo Excel/CSV
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(arrayBuffer)
    const worksheet = workbook.getWorksheet(1)
    
    if (!worksheet) {
      return NextResponse.json(
        { error: "Planilha vazia ou inválida" },
        { status: 400 }
      )
    }
    
    // Converter para array de objetos
    const data: any[] = []
    const headers: string[] = []
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Primeira linha são os headers
        row.eachCell((cell, colNumber) => {
          const headerValue = cell.value?.toString().trim() || ''
          headers[colNumber - 1] = headerValue
          console.log(`Header coluna ${colNumber}: "${headerValue}"`)
        })
      } else {
        // Demais linhas são dados
        const rowData: any = {}
        let hasData = false
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber - 1]
          if (header) {
            const cellValue = cell.value
            // Converter valor para string/number apropriado
            if (cellValue !== null && cellValue !== undefined) {
              rowData[header] = cellValue
              hasData = true
            }
          }
        })
        // Só adicionar se a linha tiver algum dado
        if (hasData) {
          data.push(rowData)
        }
      }
    })

    console.log(`Total de linhas lidas: ${data.length}`)
    console.log('Headers encontrados:', headers)
    if (data.length > 0) {
      console.log('Primeira linha de dados:', data[0])
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: "Arquivo vazio ou sem dados válidos" },
        { status: 400 }
      )
    }

    // Processar imagens se fornecidas
    let imageMap: Map<string, Buffer> = new Map()
    if (imagesZip && type === 'produtos') {
      try {
        const zipBuffer = Buffer.from(await imagesZip.arrayBuffer())
        const zip = await JSZip.loadAsync(zipBuffer)
        
        for (const [filename, file] of Object.entries(zip.files)) {
          if (!file.dir && /\.(jpg|jpeg|png|webp)$/i.test(filename)) {
            const buffer = await file.async('nodebuffer')
            const basename = filename.split('/').pop() || filename
            imageMap.set(basename, buffer)
          }
        }
      } catch (error) {
        console.error('Erro ao processar ZIP de imagens:', error)
      }
    }

    // Validar e processar dados
    let parsed: ParsedRow[] = []

    switch (type) {
      case 'produtos':
        parsed = await validateProdutos(data, imageMap)
        break
      case 'montadoras':
        parsed = await validateMontadoras(data)
        break
      case 'modelos':
        parsed = await validateModelos(data)
        break
      case 'aplicacoes':
        parsed = await validateAplicacoes(data)
        break
      default:
        return NextResponse.json(
          { error: "Tipo de importação inválido" },
          { status: 400 }
        )
    }

    const valid = parsed.filter(p => p.valid)
    const invalid = parsed.filter(p => !p.valid)
    const errors = invalid.map((p, i) => `Linha ${i + 2}: ${p.error}`)

    // Se for preview, retornar estatísticas
    if (isPreview) {
      return NextResponse.json({
        valid: valid.length,
        invalid: invalid.length,
        duplicates: 0, // TODO: implementar detecção de duplicados
        items: parsed,
        errors
      })
    }

    // Importar dados
    let imported = 0
    for (const item of valid) {
      try {
        switch (type) {
          case 'produtos':
            await importProduto(item.data)
            break
          case 'montadoras':
            await importMontadora(item.data)
            break
          case 'modelos':
            await importModelo(item.data)
            break
          case 'aplicacoes':
            await importAplicacao(item.data)
            break
        }
        imported++
      } catch (error) {
        console.error('Erro ao importar item:', error)
      }
    }

    return NextResponse.json({
      imported,
      errors: errors.length,
      message: `${imported} registro(s) importado(s) com sucesso`
    })

  } catch (error) {
    console.error("Erro ao importar dados:", error)
    return NextResponse.json(
      { error: "Erro ao processar importação" },
      { status: 500 }
    )
  }
}

// ==================== VALIDAÇÃO ====================

async function validateProdutos(data: any[], imageMap: Map<string, Buffer>): Promise<ParsedRow[]> {
  return data.map((row: any, index: number) => {
    const errors: string[] = []

    // Mapeamento flexível de colunas (aceitar múltiplos nomes)
    const nome = (
      row.Nome || row.NOME || row.nome || 
      row.Titulo || row.TITULO || row.titulo ||
      row.Title || row.TITLE
    )?.toString().trim()

    const descricao = (
      row.Descricao || row.DESCRICAO || row.descricao || 
      row.Descrição || row.DESCRIÇÃO || row.descrição ||
      row.Texto || row.TEXTO || row.texto ||
      row.Description || row.DESCRIPTION
    )?.toString().trim()

    const categoria = (
      row.Categoria || row.CATEGORIA || row.categoria ||
      row.Category || row.CATEGORY
    )?.toString().trim()

    const precoRaw = (
      row.Preco || row.PRECO || row.preco || 
      row.Preço || row.PREÇO || row.preço ||
      row.Price || row.PRICE || row.price ||
      row.Valor || row.VALOR || row.valor
    )

    if (!nome || nome === '') errors.push('Nome obrigatório')
    if (!descricao || descricao === '') errors.push('Descrição obrigatória')
    if (!categoria || categoria === '') errors.push('Categoria obrigatória')
    
    // Preço é opcional - se não tiver, usa 0
    let preco = 0
    if (precoRaw !== undefined && precoRaw !== null && precoRaw !== '') {
      preco = parseFloat(precoRaw)
      if (isNaN(preco) || preco < 0) {
        errors.push('Preço inválido')
        preco = 0
      }
    }

    // Validar estoque (opcional)
    const estoqueRaw = row.Estoque || row.ESTOQUE || row.estoque || row.Stock || row.STOCK || 0
    const estoque = estoqueRaw ? parseInt(estoqueRaw) : 0
    if (estoqueRaw && isNaN(estoque)) errors.push('Estoque inválido')

    // Validar peso (opcional)
    const pesoRaw = row.Peso || row.PESO || row.peso || row.Weight || row.WEIGHT
    const peso = pesoRaw ? parseFloat(pesoRaw) : null
    if (peso !== null && isNaN(peso)) errors.push('Peso inválido')

    // Verificar se tem imagem
    const codigo = (
      row.Codigo || row.CODIGO || row.codigo ||
      row.Code || row.CODE || row.code ||
      row.Sku || row.SKU || row.sku
    )?.toString().trim() || null

    const fabricante = (
      row.Fabricante || row.FABRICANTE || row.fabricante ||
      row.Manufacturer || row.MANUFACTURER ||
      row.Marca || row.MARCA || row.marca ||
      row.Brand || row.BRAND
    )?.toString().trim() || null

    const dimensoes = (
      row.Dimensoes || row.DIMENSOES || row.dimensoes ||
      row.Dimensões || row.DIMENSÕES || row.dimensões ||
      row.Dimensions || row.DIMENSIONS
    )?.toString().trim() || null

    const garantia = (
      row.Garantia || row.GARANTIA || row.garantia ||
      row.Warranty || row.WARRANTY
    )?.toString().trim() || null
    
    let imagemPath = (
      row.Imagem || row.IMAGEM || row.imagem ||
      row.Image || row.IMAGE || row.image ||
      row.Foto || row.FOTO || row.foto
    )?.toString().trim() || null

    if (codigo && imageMap.size > 0) {
      const imageName = `${codigo}.jpg`
      if (imageMap.has(imageName)) {
        imagemPath = `/uploads/produtos/${imageName}`
      }
    }

    // Log para debug (apenas primeiras 5 linhas)
    if (index < 5) {
      console.log(`Linha ${index + 2}:`, { 
        nome, 
        descricao: descricao?.substring(0, 50), 
        categoria, 
        preco, 
        codigo,
        errors 
      })
    }

    return {
      valid: errors.length === 0,
      data: {
        codigo,
        nome: nome || '',
        descricao: descricao || '',
        categoria: categoria || '',
        preco: !isNaN(preco) ? preco : 0,
        estoque: !isNaN(estoque) ? estoque : 0,
        fabricante,
        peso,
        dimensoes,
        garantia,
        imagem: imagemPath || '/placeholder-produto.jpg',
        imageBuffer: codigo && imageMap.get(`${codigo}.jpg`) ? imageMap.get(`${codigo}.jpg`) : null
      },
      error: errors.length > 0 ? errors.join(', ') : undefined
    }
  })
}

async function validateMontadoras(data: any[]): Promise<ParsedRow[]> {
  return data.map((row: any) => {
    const errors: string[] = []

    if (!row.Nome) errors.push('Nome obrigatório')
    if (!row.Slug) errors.push('Slug obrigatório')

    return {
      valid: errors.length === 0,
      data: {
        nome: row.Nome,
        pais: row.Pais || null,
        slug: row.Slug.toLowerCase(),
        imagemUrl: row.ImagemUrl || null
      },
      error: errors.join(', ')
    }
  })
}

async function validateModelos(data: any[]): Promise<ParsedRow[]> {
  return data.map((row: any) => {
    const errors: string[] = []

    if (!row.Nome) errors.push('Nome obrigatório')
    if (!row.Montadora) errors.push('Montadora obrigatória')
    if (!row.Slug) errors.push('Slug obrigatório')

    return {
      valid: errors.length === 0,
      data: {
        nome: row.Nome,
        montadoraNome: row.Montadora,
        tipo: row.Tipo || null,
        slug: row.Slug.toLowerCase()
      },
      error: errors.join(', ')
    }
  })
}

async function validateAplicacoes(data: any[]): Promise<ParsedRow[]> {
  return data.map((row: any) => {
    const errors: string[] = []

    if (!row.CodigoProduto) errors.push('Código do produto obrigatório')
    if (!row.Montadora) errors.push('Montadora obrigatória')
    if (!row.Modelo) errors.push('Modelo obrigatório')
    if (!row.AnoInicio) errors.push('Ano início obrigatório')
    if (!row.AnoFim) errors.push('Ano fim obrigatório')

    const anoInicio = parseInt(row.AnoInicio)
    const anoFim = parseInt(row.AnoFim)

    if (isNaN(anoInicio) || anoInicio < 1900) errors.push('Ano início inválido')
    if (isNaN(anoFim) || anoFim < anoInicio) errors.push('Ano fim inválido')

    return {
      valid: errors.length === 0,
      data: {
        codigoProduto: row.CodigoProduto,
        montadoraNome: row.Montadora,
        modeloNome: row.Modelo,
        anoInicio,
        anoFim,
        motorizacao: row.Motorizacao || null,
        versao: row.Versao || null,
        combustivel: row.Combustivel || null,
        transmissao: row.Transmissao || null,
        posicao: row.Posicao || null,
        observacoes: row.Observacoes || null
      },
      error: errors.join(', ')
    }
  })
}

// ==================== IMPORTAÇÃO ====================

async function importProduto(data: any) {
  // Salvar imagem se fornecida
  if (data.imageBuffer) {
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'produtos')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    const filename = data.imagem.split('/').pop()
    await writeFile(join(uploadDir, filename), data.imageBuffer)
  }

  delete data.imageBuffer

  await prisma.produto.upsert({
    where: { codigo: data.codigo || `AUTO-${Date.now()}` },
    update: data,
    create: {
      ...data,
      codigo: data.codigo || `AUTO-${Date.now()}`
    }
  })
}

async function importMontadora(data: any) {
  await prisma.montadora.upsert({
    where: { slug: data.slug },
    update: data,
    create: data
  })
}

async function importModelo(data: any) {
  // Buscar montadora pelo nome
  const montadora = await prisma.montadora.findFirst({
    where: { nome: { equals: data.montadoraNome, mode: 'insensitive' } }
  })

  if (!montadora) {
    throw new Error(`Montadora "${data.montadoraNome}" não encontrada`)
  }

  await prisma.modeloVeiculo.upsert({
    where: {
      nome_montadoraId: {
        nome: data.nome,
        montadoraId: montadora.id
      }
    },
    update: {
      tipo: data.tipo,
      slug: data.slug
    },
    create: {
      nome: data.nome,
      slug: data.slug,
      tipo: data.tipo,
      montadoraId: montadora.id
    }
  })
}

async function importAplicacao(data: any) {
  // Buscar produto pelo código
  const produto = await prisma.produto.findFirst({
    where: { codigo: data.codigoProduto }
  })

  if (!produto) {
    throw new Error(`Produto "${data.codigoProduto}" não encontrado`)
  }

  // Buscar montadora
  const montadora = await prisma.montadora.findFirst({
    where: { nome: { equals: data.montadoraNome, mode: 'insensitive' } }
  })

  if (!montadora) {
    throw new Error(`Montadora "${data.montadoraNome}" não encontrada`)
  }

  // Buscar modelo
  const modelo = await prisma.modeloVeiculo.findFirst({
    where: {
      nome: { equals: data.modeloNome, mode: 'insensitive' },
      montadoraId: montadora.id
    }
  })

  if (!modelo) {
    throw new Error(`Modelo "${data.modeloNome}" não encontrado para a montadora "${data.montadoraNome}"`)
  }

  // Criar aplicação
  await prisma.aplicacao.create({
    data: {
      produtoId: produto.id,
      modeloId: modelo.id,
      anoInicio: data.anoInicio,
      anoFim: data.anoFim,
      motorizacao: data.motorizacao,
      versao: data.versao,
      combustivel: data.combustivel,
      transmissao: data.transmissao,
      posicao: data.posicao,
      observacoes: data.observacoes
    }
  })
}
