import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-middleware"
import prisma from "@/lib/prisma"
import * as ExcelJS from 'exceljs'
import JSZip from 'jszip'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Função helper para ler Excel com exceljs
async function readExcelFile(buffer: Buffer): Promise<any[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const worksheet = workbook.getWorksheet(1)
  
  const data: any[] = []
  const headers: string[] = []
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // Primeira linha são os headers
      row.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value?.toString() || ''
      })
    } else {
      // Demais linhas são dados
      const rowData: any = {}
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1]
        if (header) {
          rowData[header] = cell.value
        }
      })
      data.push(rowData)
    }
  })
  
  return data
}

/**
 * POST /api/admin/catalogo/importar-klaus
 * Importa catálogo no formato Klaus Drift (múltiplos arquivos Excel)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const formData = await request.formData()
    const informacoesFile = formData.get('informacoes') as File
    const aplicacoesFile = formData.get('aplicacoes') as File
    const referenciasFile = formData.get('referencias') as File
    const adicionaisFile = formData.get('adicionais') as File
    const oemFile = formData.get('oem') as File
    const imagesZip = formData.get('images') as File | null
    const isPreview = formData.get('preview') === 'true'

    if (!informacoesFile) {
      return NextResponse.json(
        { error: "Arquivo de informações é obrigatório" },
        { status: 400 }
      )
    }

    // Processar imagens se fornecidas
    let imageMap: Map<string, Buffer> = new Map()
    if (imagesZip) {
      try {
        const zipBuffer = Buffer.from(await imagesZip.arrayBuffer())
        const zip = await JSZip.loadAsync(zipBuffer)
        
        for (const [filename, file] of Object.entries(zip.files)) {
          if (!file.dir && /\.(jpg|jpeg|png|webp)$/i.test(filename)) {
            const buffer = await file.async('nodebuffer')
            const basename = filename.split('/').pop() || filename
            // Remover extensão para mapear por código
            const codigo = basename.replace(/\.(jpg|jpeg|png|webp)$/i, '')
            imageMap.set(codigo, buffer)
          }
        }
        console.log(`📸 ${imageMap.size} imagens carregadas`)
      } catch (error) {
        console.error('Erro ao processar ZIP de imagens:', error)
      }
    }

    // Ler arquivo de informações (principal)
    const informacoesBuffer = Buffer.from(await informacoesFile.arrayBuffer())
    const informacoesData = await readExcelFile(informacoesBuffer)

    // LOG: Mostrar colunas detectadas
    if (informacoesData.length > 0) {
      console.log('📋 Colunas detectadas no arquivo de informações:')
      console.log(Object.keys(informacoesData[0]).join(', '))
      console.log('\n📊 Exemplo da primeira linha:')
      console.log(JSON.stringify(informacoesData[0], null, 2))
    }

    // Ler arquivo de aplicações
    let aplicacoesData: any[] = []
    if (aplicacoesFile) {
      const aplicacoesBuffer = Buffer.from(await aplicacoesFile.arrayBuffer())
      aplicacoesData = await readExcelFile(aplicacoesBuffer)
    }

    // Ler arquivo de referências
    let referenciasData: any[] = []
    if (referenciasFile) {
      const referenciasBuffer = Buffer.from(await referenciasFile.arrayBuffer())
      referenciasData = await readExcelFile(referenciasBuffer)
    }

    // Ler arquivo de adicionais (especificações técnicas)
    let adicionaisData: any[] = []
    if (adicionaisFile) {
      const adicionaisBuffer = Buffer.from(await adicionaisFile.arrayBuffer())
      adicionaisData = await readExcelFile(adicionaisBuffer)
    }

    // Ler arquivo OEM
    let oemData: any[] = []
    if (oemFile) {
      const oemBuffer = Buffer.from(await oemFile.arrayBuffer())
      oemData = await readExcelFile(oemBuffer)
    }

    console.log(`📊 Produtos: ${informacoesData.length}`)
    console.log(`🚗 Aplicações: ${aplicacoesData.length}`)
    console.log(`🔗 Referências: ${referenciasData.length}`)
    console.log(`⚙️ Adicionais: ${adicionaisData.length}`)
    console.log(`🏭 OEM: ${oemData.length}`)

    // Processar produtos
    const produtos = await processarProdutos(
      informacoesData,
      aplicacoesData,
      referenciasData,
      adicionaisData,
      oemData,
      imageMap
    )

    const valid = produtos.filter(p => p.valid)
    const invalid = produtos.filter(p => !p.valid)
    const errors = invalid.map((p, i) => `Código ${p.data.codigo}: ${p.error}`)

    console.log(`\n✅ Produtos válidos: ${valid.length}`)
    console.log(`❌ Produtos inválidos: ${invalid.length}`)
    if (invalid.length > 0) {
      console.log('\n🔍 Primeiros 5 erros:')
      errors.slice(0, 5).forEach(err => console.log(`  - ${err}`))
    }

    // Se for preview, retornar estatísticas
    if (isPreview) {
      return NextResponse.json({
        valid: valid.length,
        invalid: invalid.length,
        duplicates: 0,
        items: produtos.slice(0, 100), // Limitar preview a 100 items
        errors: errors.slice(0, 50), // Limitar erros a 50
        stats: {
          totalProdutos: informacoesData.length,
          totalAplicacoes: aplicacoesData.length,
          produtosComImagem: Array.from(imageMap.keys()).length
        }
      })
    }

    // Importar dados
    let imported = 0
    let skipped = 0

    for (const item of valid) {
      try {
        await importarProdutoKlaus(item.data, imageMap)
        imported++
      } catch (error: any) {
        console.error('Erro ao importar produto:', item.data.codigo, error.message)
        skipped++
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      errors: invalid.length,
      message: `${imported} produto(s) importado(s) com sucesso. ${skipped} ignorado(s).`
    })

  } catch (error) {
    console.error("Erro ao importar catálogo Klaus:", error)
    return NextResponse.json(
      { error: "Erro ao processar importação: " + (error as Error).message },
      { status: 500 }
    )
  }
}

// ==================== PROCESSAMENTO ====================

async function processarProdutos(
  informacoes: any[],
  aplicacoes: any[],
  referencias: any[],
  adicionais: any[],
  oem: any[],
  imageMap: Map<string, Buffer>
) {
  const produtos = informacoes.map((info: any) => {
    const errors: string[] = []
    
    // Aceitar diferentes variações dos nomes de colunas
    const codigo = String(
      info.CODIGO || 
      info.Codigo || 
      info.codigo || 
      info.CÓDIGO || 
      info.Código || 
      info['CÓDIGO'] ||
      info.COD ||
      ''
    ).trim()
    
    if (!codigo) {
      errors.push('Código obrigatório')
      console.warn('⚠️ Produto sem código:', Object.keys(info).slice(0, 5))
      return { valid: false, data: {}, error: errors.join(', ') }
    }

    const nome = String(
      info.TITULO || 
      info.Titulo || 
      info.titulo || 
      info.NOME || 
      info.Nome || 
      info.nome || 
      info.DESCRICAO ||
      info.Descricao ||
      ''
    ).trim()
    
    if (!nome) {
      errors.push('Título obrigatório')
      console.warn('⚠️ Produto sem nome:', codigo)
    }

    const categoria = String(
      info.CATEGORIA || 
      info.Categoria || 
      info.categoria || 
      info.GRUPO ||
      info.Grupo ||
      'Sem categoria'
    ).trim()
    
    const slug = String(info.SLUG || info.Slug || info.slug || '').trim()

    // Buscar aplicações deste produto
    const aplicacoesProduto = aplicacoes.filter((a: any) => {
      const codAplicacao = String(
        a.CODIGO || 
        a.Codigo || 
        a.codigo || 
        a.CÓDIGO || 
        a['CÓDIGO'] ||
        a.COD ||
        ''
      ).trim()
      return codAplicacao === codigo
    })

    // Buscar referências
    const referenciasProduto = referencias.find((r: any) => 
      String(r['CÓDIGO']) === codigo
    )

    // Buscar dados adicionais
    const adicionaisProduto = adicionais.find((a: any) => 
      String(a['Código']) === codigo
    )

    // Buscar dados OEM
    const oemProduto = oem.find((o: any) => 
      String(o['CÓDIGO']) === codigo
    )

    // Montar descrição completa
    let descricao = String(info.TEXTO || nome).trim()
    
    // Adicionar especificações técnicas à descrição
    if (adicionaisProduto) {
      const specs: string[] = []
      
      if (adicionaisProduto['Dimensões']) specs.push(`Dimensões: ${adicionaisProduto['Dimensões']}`)
      if (adicionaisProduto['Peso KG']) specs.push(`Peso: ${adicionaisProduto['Peso KG']}kg`)
      if (adicionaisProduto['Material']) specs.push(`Material: ${adicionaisProduto['Material']}`)
      if (adicionaisProduto['Garantia']) specs.push(`Garantia: ${adicionaisProduto['Garantia']}`)
      if (adicionaisProduto['Tensão']) specs.push(`Tensão: ${adicionaisProduto['Tensão']}`)
      if (adicionaisProduto['Sistema']) specs.push(`Sistema: ${adicionaisProduto['Sistema']}`)
      
      if (specs.length > 0) {
        descricao += '\n\nEspecificações Técnicas:\n' + specs.join('\n')
      }
    }

    // Adicionar referências cruzadas
    if (referenciasProduto && referenciasProduto['REF. ORIGINAL']) {
      descricao += `\n\nReferências: ${referenciasProduto['REF. ORIGINAL']}`
    }

    // Adicionar informações OEM
    if (oemProduto) {
      const oemInfo: string[] = []
      if (oemProduto['MONTADORA']) oemInfo.push(`Montadora: ${oemProduto['MONTADORA']}`)
      if (oemProduto['REFERÊNCIA']) oemInfo.push(`Ref. OEM: ${oemProduto['REFERÊNCIA']}`)
      
      if (oemInfo.length > 0) {
        descricao += '\n\nInformações OEM:\n' + oemInfo.join('\n')
      }
    }

    // Imagem (usar apenas do ZIP, ignorar URLs externas do Excel)
    let imagem = ''
    if (imageMap.has(codigo)) {
      imagem = `/uploads/produtos/${codigo}.jpg`
    }
    // Se não tiver imagem no ZIP, deixar vazio para mostrar placeholder

    return {
      valid: errors.length === 0,
      data: {
        codigo,
        nome,
        slug: slug || gerarSlug(nome),
        descricao,
        categoria,
        imagem,
        destaque: info.DESTAQUE === 1 || info.DESTAQUE === '1',
        fabricante: 'Drift Brasil',
        aplicacoes: aplicacoesProduto,
        referencias: referenciasProduto,
        adicionais: adicionaisProduto,
        imageBuffer: imageMap.get(codigo)
      },
      error: errors.join(', ')
    }
  })

  return produtos
}

async function importarProdutoKlaus(data: any, imageMap: Map<string, Buffer>) {
  // Salvar imagem se fornecida
  if (data.imageBuffer) {
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'produtos')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    const filename = `${data.codigo}.jpg`
    await writeFile(join(uploadDir, filename), data.imageBuffer)
    console.log(`📸 Imagem salva: ${filename}`)
  }

  // Criar/atualizar produto
  const produto = await prisma.produto.upsert({
    where: { codigo: data.codigo },
    update: {
      nome: data.nome,
      descricao: data.descricao,
      categoria: data.categoria,
      imagem: data.imagem,
      destaque: data.destaque,
      fabricante: data.fabricante,
      preco: 0, // Catálogo de consulta, não venda
      estoque: 0
    },
    create: {
      codigo: data.codigo,
      nome: data.nome,
      descricao: data.descricao,
      categoria: data.categoria,
      imagem: data.imagem,
      destaque: data.destaque,
      fabricante: data.fabricante,
      preco: 0, // Catálogo de consulta, não venda
      estoque: 0
    }
  })

  // Importar aplicações
  if (data.aplicacoes && data.aplicacoes.length > 0) {
    for (const app of data.aplicacoes) {
      try {
        await importarAplicacaoKlaus(produto.id, app)
      } catch (error) {
        console.warn(`⚠️ Erro ao importar aplicação:`, error)
      }
    }
  }

  return produto
}

async function importarAplicacaoKlaus(produtoId: string, aplicacao: any) {
  const montadoraNome = String(aplicacao.MONTADORA || '').trim()
  const modeloNome = String(aplicacao.MODELO || '').trim()
  
  if (!montadoraNome || montadoraNome === 'UNIVERSAL') {
    return // Pular aplicações universais
  }

  // Buscar ou criar montadora
  let montadora = await prisma.montadora.findFirst({
    where: { nome: { equals: montadoraNome, mode: 'insensitive' } }
  })

  if (!montadora) {
    const slug = gerarSlug(montadoraNome)
    montadora = await prisma.montadora.create({
      data: {
        nome: montadoraNome,
        slug,
        pais: null,
        imagemUrl: null
      }
    })
    console.log(`🏭 Montadora criada: ${montadoraNome}`)
  }

  if (!modeloNome) return

  // Buscar ou criar modelo
  let modelo = await prisma.modeloVeiculo.findFirst({
    where: {
      nome: { equals: modeloNome, mode: 'insensitive' },
      montadoraId: montadora.id
    }
  })

  if (!modelo) {
    const slug = gerarSlug(modeloNome)
    modelo = await prisma.modeloVeiculo.create({
      data: {
        nome: modeloNome,
        slug,
        montadoraId: montadora.id,
        tipo: null
      }
    })
    console.log(`🚗 Modelo criado: ${modeloNome}`)
  }

  // Criar aplicação
  const anoInicio = parseInt(aplicacao.DE) || 1960
  const anoFim = parseInt(aplicacao.ATE) || new Date().getFullYear()
  const motorizacao = String(aplicacao.MOTOR || aplicacao.VERSAO || '').trim() || null
  const versao = String(aplicacao.VERSAO || '').trim() || null
  const combustivel = String(aplicacao.COMBUSTIVEL || '').trim() || null
  const transmissao = String(aplicacao.TRANSMISSAO || '').trim() || null

  // Verificar se já existe
  const existente = await prisma.aplicacao.findFirst({
    where: {
      produtoId,
      modeloId: modelo.id,
      anoInicio,
      anoFim,
      motorizacao
    }
  })

  if (!existente) {
    await prisma.aplicacao.create({
      data: {
        produtoId,
        modeloId: modelo.id,
        anoInicio,
        anoFim,
        motorizacao,
        versao,
        combustivel,
        transmissao,
        posicao: null,
        observacoes: aplicacao.DESCRICAO || null
      }
    })
  }
}

function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
