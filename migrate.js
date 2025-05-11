const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');
require('dotenv').config();

async function migrateDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable not set');
  }

  const connectionString = process.env.DATABASE_URL;
  
  // For Postgres.js: SSL is already configured in the connection string if needed
  const client = postgres(connectionString);
  const db = drizzle(client);
  
  console.log('Starting migration...');
  await migrate(db, { migrationsFolder: './migrations' });
  console.log('Migration completed successfully!');
  
  // Close connection to prevent script from hanging
  await client.end();
}

migrateDb()
  .then(() => process.exit(0))
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  });
