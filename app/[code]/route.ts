import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    if (!sql) {
      return new NextResponse('Database not configured', { status: 503 })
    }

    const { code } = await params
    
    if (!code) {
      return new NextResponse('Code parameter is required', { status: 400 })
    }

    // Get the link from database
    const links = await sql`
      SELECT * FROM links WHERE code = ${code} LIMIT 1
    `
    
    if (!links || links.length === 0) {
      return new NextResponse('Link not found', { status: 404 })
    }
    
    const link = links[0]
    const targetUrl = link.target_url
    
    if (!targetUrl) {
      return new NextResponse('Invalid target URL', { status: 500 })
    }

    // Update click count and last clicked time
    try {
      await sql`
        UPDATE links 
        SET 
          clicks = COALESCE(clicks, 0) + 1, 
          last_clicked = NOW()
        WHERE code = ${code}
      `
    } catch (updateError) {
      console.error('Failed to update click count:', updateError)
      // Don't fail the redirect if click count update fails
    }

    // Perform redirect
    return NextResponse.redirect(targetUrl)
  } catch (error) {
    console.error('❌ Redirect failed:', error)
    return new NextResponse(
      'Redirect failed: ' + (error instanceof Error ? error.message : 'Unknown error'), 
      { status: 500 }
    )
  }
}