import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/db'

export async function GET() {
  const dbStatus = await testConnection()
  
  const healthStatus = {
    ok: dbStatus.connected,
    status: dbStatus.connected ? 'healthy' : 'unhealthy',
    version: '1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbStatus.connected,
      name: dbStatus.database,
      error: dbStatus.error
    },
    environment: process.env.NODE_ENV || 'development',
    message: dbStatus.connected ? 'All systems operational' : dbStatus.error
  }
  
  return NextResponse.json(healthStatus, {
    status: healthStatus.ok ? 200 : 503
  })
}