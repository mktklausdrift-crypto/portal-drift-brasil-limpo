// API Route: Tunnel Sentry - Portal Klaus Drift Brasil
// Proxy para evitar bloqueios de ad-blockers

import { NextRequest, NextResponse } from 'next/server';

const SENTRY_HOST = 'o4504977027948544.ingest.sentry.io';
const SENTRY_PROJECT_IDS = ['4504977027948544']; // Adicionar IDs dos projetos

export async function POST(request: NextRequest) {
  try {
    const envelope = await request.text();
    
    // Parse do envelope do Sentry
    const pieces = envelope.split('\n');
    const header = JSON.parse(pieces[0]);
    
    // Validar se é um projeto conhecido
    const projectId = header?.dsn?.split('/').pop();
    if (!projectId || !SENTRY_PROJECT_IDS.includes(projectId)) {
      return NextResponse.json({ error: 'Invalid project' }, { status: 400 });
    }
    
    // Construir URL do Sentry
    const sentryUrl = `https://${SENTRY_HOST}/api/${projectId}/envelope/`;
    
    // Repassar requisição para o Sentry
    const response = await fetch(sentryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'User-Agent': request.headers.get('user-agent') || 'Klaus-Drift-Tunnel/1.0',
      },
      body: envelope,
    });
    
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error) {
    console.error('Sentry tunnel error:', error);
    return NextResponse.json({ error: 'Tunnel error' }, { status: 500 });
  }
}

// Suporte para OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}