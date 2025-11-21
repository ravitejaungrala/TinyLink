import { NextResponse } from 'next/server'
import { sql, testConnection } from '@/lib/db'

export async function GET() {
  try {
    const dbStatus = await testConnection()
    
    if (!dbStatus.connected) {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: dbStatus.error 
        },
        { status: 500 }
      )
    }

    // Test a simple query
    const result = await sql`SELECT COUNT(*) as link_count FROM links`
    
    return NextResponse.json({
      status: 'success',
      database: 'connected',
      currentTime: dbStatus.serverTime,
      databaseName: dbStatus.database,
      linkCount: result[0].link_count
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Database test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}