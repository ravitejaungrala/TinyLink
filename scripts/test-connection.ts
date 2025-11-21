import { testConnection } from '../lib/db'

async function main() {
  console.log('🔌 Testing database connection...')
  const result = await testConnection()
  
  if (result.connected) {
    console.log('✅ Connection successful!')
    console.log(`📊 Database: ${result.database}`)
    console.log(`⏰ Server Time: ${result.serverTime}`)
    console.log(`ℹ️  Version: ${result.version?.split(',')[0]}`)
  } else {
    console.log('❌ Connection failed!')
    console.log(`Error: ${result.error}`)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}