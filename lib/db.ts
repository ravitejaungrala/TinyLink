import postgres from 'postgres'

// Use the connection string from environment variables
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables. Please check your .env.local file.')
}

// Configure postgres for Neon
export const sql = postgres(connectionString, {
  ssl: 'require',
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  connect_timeout: 10,
})

// Test connection function
export async function testConnection() {
  try {
    const result = await sql`SELECT version(), NOW() as server_time, current_database() as db_name`
    console.log('✅ Database connected successfully')
    return {
      connected: true,
      database: result[0].db_name,
      serverTime: result[0].server_time,
      version: result[0].version
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Initialize database
export async function initDB() {
  try {
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'links'
      )
    `
    
    if (!tableExists[0].exists) {
      console.log('🔄 Creating links table...')
      await sql`
        CREATE TABLE links (
          id SERIAL PRIMARY KEY,
          code VARCHAR(8) UNIQUE NOT NULL,
          target_url TEXT NOT NULL,
          clicks INTEGER DEFAULT 0,
          last_clicked TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
      
      await sql`CREATE INDEX idx_links_code ON links(code)`
      await sql`CREATE INDEX idx_links_created_at ON links(created_at DESC)`
      
      console.log('✅ Database tables initialized successfully')
    } else {
      console.log('✅ Links table already exists')
    }
    
    return { success: true }
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Generate a random code
export function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Check if a code already exists
export async function codeExists(code: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT 1 FROM links WHERE code = ${code} LIMIT 1
    `
    return result.length > 0
  } catch (error) {
    console.error('Error checking code existence:', error)
    return false
  }
}