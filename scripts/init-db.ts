import { initDB, testConnection } from '../lib/db'

async function main() {
  console.log('🚀 Initializing TinyLink Database...')
  
  // Test connection first
  const connectionTest = await testConnection()
  if (!connectionTest.connected) {
    console.error('❌ Cannot initialize database without connection')
    process.exit(1)
  }
  
  // Initialize database tables
  try {
    await initDB()
    console.log('🎉 Database initialization completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('💥 Database initialization failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}