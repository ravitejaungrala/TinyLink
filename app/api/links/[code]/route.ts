import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    
    if (!code) {
      return NextResponse.json(
        { error: 'Code parameter is required' },
        { status: 400 }
      )
    }

    const links = await sql`
      SELECT * FROM links WHERE code = ${code}
    `
    
    if (!links || links.length === 0) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(links[0])
  } catch (error) {
    console.error('Failed to fetch link:', error)
    return NextResponse.json(
      { error: 'Failed to fetch link' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    
    if (!code) {
      return NextResponse.json(
        { error: 'Code parameter is required' },
        { status: 400 }
      )
    }

    const result = await sql`
      DELETE FROM links WHERE code = ${code}
    `
    
    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete link:', error)
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    )
  }
}