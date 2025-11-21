import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/db'

export async function GET() {
  const dbStatus = await testConnection()
  
  return NextResponse.json({
    ok: true,
    version: '1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus.connected ? 'connected' : 'disconnected'
  })
}