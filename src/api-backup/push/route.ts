import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// Configurar VAPID keys (gerar com: npx web-push generate-vapid-keys)
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
}

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:contato@klausdrift.com.br',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscription, notification } = body

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription is required' },
        { status: 400 }
      )
    }

    // Validar subscription
    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription format' },
        { status: 400 }
      )
    }

    // Payload da notificação
    const payload = JSON.stringify({
      title: notification?.title || 'Klaus Drift',
      body: notification?.body || 'Nova notificação',
      icon: notification?.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      image: notification?.image,
      tag: notification?.tag || 'default',
      requireInteraction: notification?.requireInteraction || false,
      actions: notification?.actions || [
        { action: 'open', title: 'Abrir' },
        { action: 'close', title: 'Fechar' }
      ],
      data: notification?.data || {}
    })

    // Enviar push notification
    await webpush.sendNotification(subscription, payload)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error sending push notification:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// GET: Retornar a chave pública VAPID
export async function GET() {
  return NextResponse.json({
    publicKey: vapidKeys.publicKey
  })
}
