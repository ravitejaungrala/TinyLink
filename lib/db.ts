import postgres from 'postgres'

// Use the connection string from environment variables
const connectionString = process.env.DATABASE_URL

// Enhanced database configuration with better error handling
let sql: any = null

if (connectionString) {
  try {
    sql = postgres(connectionString, {
      ssl: { rejectUnauthorized: false },
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      connect_timeout: 10,
      max: 5,
      onnotice: () => {}, // Suppress notices
      transform: {
        undefined: null,
      },
    })
    console.log('✅ Database connection configured')
  } catch (error) {
    console.error('❌ Failed to configure database connection:', error)
    sql = null
  }
} else {
  console.warn('⚠️ DATABASE_URL is not set')
}

// Enhanced connection test function
export async function testConnection() {
  if (!sql) {
    return {
      connected: false,
      error: 'Database not configured - DATABASE_URL is missing or invalid'
    }
  }

  try {
    const result = await sql`SELECT version(), NOW() as server_time, current_database() as db_name`
    console.log('✅ Database connected successfully')
    return {
      connected: true,
      database: result[0].db_name,
      serverTime: result[0].server_time,
      version: result[0].version
    }
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message)
    return {
      connected: false,
      error: error.message || 'Unknown database error'
    }
  }
}

// Initialize database tables with error handling
export async function initDB() {
  if (!sql) {
    throw new Error('Database not configured - DATABASE_URL is missing')
  }

  try {
    // Check if table exists first
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
      
      // Create indexes for better performance
      await sql`CREATE INDEX idx_links_code ON links(code)`
      await sql`CREATE INDEX idx_links_created_at ON links(created_at DESC)`
      await sql`CREATE INDEX idx_links_last_clicked ON links(last_clicked DESC)`
      
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
  if (!sql) {
    throw new Error('Database not configured - DATABASE_URL is missing')
  }

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

// Export the sql instance
export { sql }