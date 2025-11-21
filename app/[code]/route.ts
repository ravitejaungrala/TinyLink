import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    
    if (!code) {
      return new NextResponse('Code parameter is required', { status: 400 })
    }

    console.log(`🔗 Redirect attempt for code: ${code}`)

    // Get the link from database
    const links = await sql`
      SELECT * FROM links WHERE code = ${code} LIMIT 1
    `
    
    if (!links || links.length === 0) {
      console.log(`❌ Link not found for code: ${code}`)
      return new NextResponse('Link not found', { status: 404 })
    }
    
    const link = links[0]
    const targetUrl = link.target_url
    
    if (!targetUrl) {
      console.log(`❌ Target URL is empty for code: ${code}`)
      return new NextResponse('Invalid target URL', { status: 500 })
    }

    console.log(`✅ Redirecting to: ${targetUrl}`)

    // Update click count and last clicked time
    try {
      const updateResult = await sql`
        UPDATE links 
        SET 
          clicks = COALESCE(clicks, 0) + 1, 
          last_clicked = NOW()
        WHERE code = ${code}
        RETURNING clicks, last_clicked
      `
      
      if (updateResult && updateResult.length > 0) {
        console.log(`📊 Successfully updated click count for ${code}: ${updateResult[0].clicks} total clicks`)
      }
    } catch (updateError) {
      console.error('❌ Failed to update click count:', updateError)
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