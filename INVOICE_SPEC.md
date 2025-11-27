# Invoice Generation System - Specification

## Overview
A service to generate and save professional PDF invoices with customer management, product catalog, and automatic calculations.

## Core Features

### 1. Business/Company Management
Store company details used in invoice header:
- Company name
- Full address (street, city, postal code, country)
- VAT registration number
- Contact information (email, phone)
- Company logo (image file)

### 2. Customer Management
**Persistent customer database** with the following fields:
- Customer name (required)
- VAT registration number (required)
- Full address:
  - Street address
  - City
  - Postal code
  - Country
- Email address
- Phone number

**Actions:**
- Create new customer
- Edit existing customer
- Select customer from list when creating invoice

### 3. Invoice Generation

#### Invoice Metadata
- **Invoice number:** Auto-increment sequential format (INV-001, INV-002, etc.)
- **Creation date:** Automatically set to current date
- **Due date:**
  - Default: 3 days from creation date
  - Can be manually specified when creating invoice

#### Line Items
Support both pre-defined products and custom line items:

**Product Catalog:**
- Store products/services with default prices
- Can override price per invoice

**Line Item Fields:**
- Description (required)
- Quantity (required)
- Unit price (required)
- Line total (calculated: quantity × unit price)
- Optional additional description/notes per line item

#### VAT/Tax
- Optional VAT rate per invoice (e.g., 0%, 14%, 15%)
- Auto-calculate VAT amount from rate
- Some invoices may have 0% VAT

#### Calculations
- **Subtotal:** Sum of all line totals (before VAT)
- **VAT Amount:** Subtotal × VAT rate
- **Total:** Subtotal + VAT Amount

### 4. Payment Terms & Notes

**Bank Details Section:**
- Account holder name
- Bank name
- Account number
- Sort code / Branch code
- IBAN (if applicable)

**Additional Notes:**
- Free-text notes field per invoice
- Can include payment terms (e.g., "Net 3 days", "Payment due on receipt")

### 5. PDF Generation

**Template Design:**
- Professional, clean business template
- Reference design: `invoice-template-design.png` (to be provided)

**PDF Features:**
- Company logo in header
- Clear sections for:
  - Business details (top left/right)
  - Customer details
  - Invoice metadata (number, dates)
  - Line items table with columns:
    - Item # (optional numbering)
    - Description
    - Quantity
    - Unit Price
    - Line Total
  - Subtotals breakdown:
    - Subtotal (before VAT)
    - VAT (rate + amount)
    - **Total Amount Due** (prominent)
  - Bank details section
  - Additional notes section

**Output:**
- Save PDF to disk in specified folder
- Filename format: `INV-{number}_{customer-name}_{date}.pdf`

## Technical Requirements

### Currency
- **ZAR (South African Rand)** for all amounts
- Display format: R 1,234.56

### Data Storage
- **SQLite database** for all data
- Tables needed:
  - `business_info` - Company details (single row)
  - `customers` - Customer database
  - `products` - Product catalog
  - `invoices` - Invoice headers
  - `invoice_line_items` - Invoice line items

### Technology Stack
- **Runtime:** Bun
- **Database:** SQLite (via `bun:sqlite`)
- **Effect:** Use Effect TypeScript for service layer
- **PDF Generation:** TBD (need to select appropriate library)

## Non-Requirements
- ❌ Invoice status tracking (Draft, Paid, Overdue) - not needed
- ❌ Email sending - just save PDF to disk
- ❌ Multiple currencies - only ZAR
- ❌ Printing integration - user will print manually
- ❌ Discounts - not needed in v1
- ❌ Partial payments tracking

## User Workflows

### Create New Invoice
1. Select or create customer
2. Add line items:
   - Select from product catalog OR
   - Add custom line item
   - Specify quantity and price (default or override)
   - Add optional description
3. Set VAT rate (default or specify)
4. Set due date (default: 3 days from today)
5. Add payment notes if needed
6. Generate PDF
7. Save to disk

### Manage Customers
1. View list of customers
2. Add new customer with all details
3. Edit existing customer
4. Delete customer (if no invoices)

### Manage Products
1. View product catalog
2. Add new product with default price
3. Edit product details
4. Delete product

### Manage Business Details
1. View current business information
2. Edit business details
3. Upload/update logo

## Data Validation Rules

### Customer
- Name: required, min 2 characters
- VAT number: required, valid format
- Email: valid email format
- Phone: valid phone format

### Line Items
- Description: required, min 3 characters
- Quantity: required, positive number
- Unit price: required, non-negative number

### Invoice
- Customer: required (must select from database)
- At least one line item required
- Due date: must be today or future date
- VAT rate: 0-100%

## Future Enhancements (Out of Scope)
- Invoice status tracking and payment marking
- Recurring invoices
- Email integration
- Multiple templates
- Reports and analytics
- Multi-user support
- Cloud backup
