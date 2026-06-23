const db = require('../config/database');

async function up() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS product_search_clicks (
      product_id INT PRIMARY KEY,
      click_count INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);
  console.log('product_search_clicks table created');
}

up().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
