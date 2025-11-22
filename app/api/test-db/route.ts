import { NextResponse } from 'next/server'
import { sql, testConnection } from '@/lib/db'

export async function GET() {
  try {
    const dbStatus = await testConnection()
    
    return NextResponse.json({
      status: dbStatus.connected ? 'success' : 'error',
      database: dbStatus.connected ? 'connected' : 'disconnected',
      message: dbStatus.connected ? 'Database is connected' : dbStatus.error,
      currentTime: dbStatus.serverTime,
      databaseName: dbStatus.database,
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Database test failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}