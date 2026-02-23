/**
 * Migration: Backfill bank_accounts from business_info
 *
 * 1. Creates the bank_accounts table if it doesn't exist
 * 2. Adds bank_account_id + currency columns to invoices if missing
 * 3. Creates a default bank account from the existing business_info bank fields
 * 4. Points all existing invoices to that bank account with currency=ZAR
 *
 * Safe to run multiple times — skips if a default bank account already exists.
 *
 * Usage: bun scripts/migrate-bank-accounts.ts
 */

import { Database } from "bun:sqlite"
import { resolve } from "node:path"

const dbPath = resolve(import.meta.dir, "../invoices.db")
const db = new Database(dbPath)

console.log(`📂 Database: ${dbPath}`)

// 1. Create bank_accounts table if missing
db.run(`
  CREATE TABLE IF NOT EXISTS bank_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'ZAR',
    account_holder_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT,
    branch_code TEXT,
    iban TEXT,
    swift_bic TEXT,
    bank_address TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)
console.log("✅ bank_accounts table ensured")

// 1b. Add IBAN/SWIFT/address columns if table existed before this update
const bankCols = db
  .query("PRAGMA table_info(bank_accounts)")
  .all() as { name: string }[]

const bankColNames = bankCols.map((c) => c.name)

for (const [col, sql] of [
  ["iban", "ALTER TABLE bank_accounts ADD COLUMN iban TEXT"],
  ["swift_bic", "ALTER TABLE bank_accounts ADD COLUMN swift_bic TEXT"],
  ["bank_address", "ALTER TABLE bank_accounts ADD COLUMN bank_address TEXT"],
] as const) {
  if (!bankColNames.includes(col)) {
    db.run(sql)
    console.log(`✅ Added ${col} column to bank_accounts`)
  }
}

// 2. Add new columns to invoices if missing
const invoiceCols = db
  .query("PRAGMA table_info(invoices)")
  .all() as { name: string }[]

const colNames = invoiceCols.map((c) => c.name)

if (!colNames.includes("bank_account_id")) {
  db.run("ALTER TABLE invoices ADD COLUMN bank_account_id INTEGER REFERENCES bank_accounts(id)")
  console.log("✅ Added bank_account_id column to invoices")
} else {
  console.log("⏭️  bank_account_id column already exists")
}

if (!colNames.includes("currency")) {
  db.run("ALTER TABLE invoices ADD COLUMN currency TEXT NOT NULL DEFAULT 'ZAR'")
  console.log("✅ Added currency column to invoices")
} else {
  console.log("⏭️  currency column already exists")
}

// 3. Create default bank account from business_info (if none exists)
const existingDefault = db
  .query("SELECT id FROM bank_accounts WHERE is_default = 1")
  .get() as { id: number } | null

if (existingDefault) {
  console.log(`⏭️  Default bank account already exists (id=${existingDefault.id})`)
} else {
  const biz = db
    .query("SELECT account_holder_name, bank_name, account_number, branch_code FROM business_info WHERE id = 1")
    .get() as {
      account_holder_name: string
      bank_name: string
      account_number: string
      branch_code: string
    } | null

  if (biz) {
    db.run(
      `INSERT INTO bank_accounts (label, currency, account_holder_name, bank_name, account_number, branch_code, is_default)
       VALUES (?, 'ZAR', ?, ?, ?, ?, 1)`,
      [`${biz.bank_name} (ZAR)`, biz.account_holder_name, biz.bank_name, biz.account_number, biz.branch_code]
    )
    const newId = (db.query("SELECT last_insert_rowid() as id").get() as { id: number }).id
    console.log(`✅ Created default bank account (id=${newId}) from business_info`)

    // 4. Backfill existing invoices
    const result = db.run(
      "UPDATE invoices SET bank_account_id = ?, currency = 'ZAR' WHERE bank_account_id IS NULL",
      [newId]
    )
    console.log(`✅ Updated ${result.changes} existing invoices → bank_account_id=${newId}, currency=ZAR`)
  } else {
    console.log("⚠️  No business_info found — skipping bank account creation. Add one via the UI first.")
  }
}

// Summary
const totalAccounts = (db.query("SELECT count(*) as n FROM bank_accounts").get() as { n: number }).n
const nullInvoices = (db.query("SELECT count(*) as n FROM invoices WHERE bank_account_id IS NULL").get() as { n: number }).n
console.log(`\n📊 Summary: ${totalAccounts} bank account(s), ${nullInvoices} invoice(s) still missing bank_account_id`)

db.close()
console.log("🏁 Done")
