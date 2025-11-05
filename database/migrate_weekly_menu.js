/**
 * Migration Script: Weekly Menu Creation Feature
 * 
 * This script executes the weekly_menu_schema.sql file to create all necessary
 * database tables, views, and stored procedures for the Weekly Menu Creation feature.
 * 
 * Usage:
 *   node database/migrate_weekly_menu.js
 * 
 * Prerequisites:
 *   - MySQL server running
 *   - Database 'recipe_costing_db' exists
 *   - Proper credentials in environment variables or defaults
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mysql',
  database: process.env.DB_NAME || 'recipe_costing_db',
  multipleStatements: true // Required for executing multiple SQL statements
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Starting Weekly Menu migration...\n');
    
    // Read the SQL schema file
    console.log('📖 Reading schema file...');
    const schemaPath = path.join(__dirname, 'weekly_menu_schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    console.log('✅ Schema file loaded\n');
    
    // Connect to database
    console.log('🔌 Connecting to MySQL database...');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}\n`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');
    
    // Execute the schema
    console.log('🚀 Executing schema...');
    await connection.query(schemaSql);
    console.log('✅ Schema executed successfully\n');
    
    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN (
        'recipe_images', 
        'weekly_menus', 
        'weekly_menu_items', 
        'canva_templates', 
        'menu_shares', 
        'menu_feedback'
      )
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    console.log('✅ Tables created:');
    tables.forEach(table => {
      console.log(`   ✓ ${table.TABLE_NAME}`);
    });
    console.log();
    
    // Verify views were created
    console.log('🔍 Verifying views...');
    const [views] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.VIEWS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('weekly_menu_summary', 'recipe_with_default_image')
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    if (views.length > 0) {
      console.log('✅ Views created:');
      views.forEach(view => {
        console.log(`   ✓ ${view.TABLE_NAME}`);
      });
      console.log();
    }
    
    // Verify stored procedures were created
    console.log('🔍 Verifying stored procedures...');
    const [procedures] = await connection.query(`
      SELECT ROUTINE_NAME 
      FROM INFORMATION_SCHEMA.ROUTINES 
      WHERE ROUTINE_SCHEMA = ? 
      AND ROUTINE_TYPE = 'PROCEDURE'
      AND ROUTINE_NAME = 'get_weekly_menu_details'
    `, [dbConfig.database]);
    
    if (procedures.length > 0) {
      console.log('✅ Stored procedures created:');
      procedures.forEach(proc => {
        console.log(`   ✓ ${proc.ROUTINE_NAME}`);
      });
      console.log();
    }
    
    // Get table statistics
    console.log('📊 Table Statistics:');
    for (const table of tables) {
      const [stats] = await connection.query(`
        SELECT 
          COUNT(*) as row_count,
          ROUND(DATA_LENGTH / 1024, 2) as data_size_kb
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      `, [dbConfig.database, table.TABLE_NAME]);
      
      console.log(`   ${table.TABLE_NAME}: ${stats[0].row_count} rows, ${stats[0].data_size_kb} KB`);
    }
    console.log();
    
    console.log('🎉 Migration completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Review the created tables in your database');
    console.log('   2. Start the backend server: npm run dev:server');
    console.log('   3. Test the API endpoints');
    console.log('   4. Begin implementing the frontend pages\n');
    
  } catch (error) {
    console.error('❌ Migration failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Make sure MySQL server is running');
      console.error('   - Check your database credentials');
      console.error('   - Verify the database exists');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check your MySQL username and password');
      console.error('   - Verify user has proper permissions');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Database does not exist');
      console.error('   - Create it with: CREATE DATABASE recipe_costing_db;');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
runMigration();
