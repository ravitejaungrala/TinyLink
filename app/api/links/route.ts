import { NextRequest, NextResponse } from 'next/server'
import { sql, generateCode, codeExists } from '@/lib/db'
import { linkSchema } from '@/lib/utils'

export async function GET() {
  try {
    const links = await sql`
      SELECT 
        id,
        code,
        target_url,
        COALESCE(clicks, 0) as clicks,
        last_clicked,
        created_at
      FROM links 
      ORDER BY 
        COALESCE(last_clicked, created_at) DESC,
        created_at DESC
    `
    
    return NextResponse.json(links)
  } catch (error) {
    console.error('Failed to fetch links:', error)
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = linkSchema.safeParse(body)
    
    if (!validatedData.success) {
      // FIXED: Use issues array instead of errors
      const firstError = validatedData.error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    
    let { target_url, code } = validatedData.data
    
    if (!target_url) {
      return NextResponse.json(
        { error: 'target_url is required' },
        { status: 400 }
      )
    }
    
    // Ensure URL has protocol
    if (!target_url.startsWith('http://') && !target_url.startsWith('https://')) {
      target_url = 'https://' + target_url
    }
    
    // Generate random code if not provided
    let finalCode: string
    if (!code) {
      let attempts = 0
      let isUnique = false
      
      do {
        finalCode = generateCode()
        isUnique = !(await codeExists(finalCode))
        attempts++
        
        if (attempts > 10) {
          return NextResponse.json(
            { error: 'Failed to generate unique code' },
            { status: 500 }
          )
        }
      } while (!isUnique)
    } else {
      finalCode = code
      // Check if custom code already exists
      if (await codeExists(finalCode)) {
        return NextResponse.json(
          { error: 'Code already exists' },
          { status: 409 }
        )
      }
    }
    
    // Insert new link
    const result = await sql`
      INSERT INTO links (code, target_url, clicks) 
      VALUES (${finalCode}, ${target_url}, 0)
      RETURNING *
    `
    
    if (!result || result.length === 0) {
      throw new Error('Failed to create link')
    }
    
    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error('Failed to create link:', error)
    
    return NextResponse.json(
      { error: 'Failed to create link: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}