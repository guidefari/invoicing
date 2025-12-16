# API Testing with Postman

This directory contains Postman collection files for testing the Invoice System API.

## Getting Started

1. **Start the API server:**
   ```bash
   bun run server
   ```
   The server will start on `http://localhost:3000`

2. **Import collections into Postman:**
   - Open Postman
   - Click "Import" button
   - Select the JSON files from this directory:
     - `business-info.json` - Business information management
     - `customers.json` - Customer CRUD operations
     - `products.json` - Product CRUD operations
     - `invoices.json` - Invoice CRUD operations

3. **Base URL:**
   All collections use a variable `{{baseUrl}}` set to `http://localhost:3000`
   You can change this in Postman's environment settings if needed.

## Available Endpoints

### Business Info
- `GET /api/business-info` - Get business information
- `POST /api/business-info` - Create or update business information
- `PUT /api/business-info` - Create or update business information

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice by ID (includes line items)
- `POST /api/invoices` - Create new invoice with line items
- `GET /api/invoices/:id/pdf` - Generate and download invoice PDF

## Testing Workflow

1. **Set up business information (required for PDF generation):**
   - Use the "Create/Update Business Info" request in the business-info collection
   - This is required before you can generate invoice PDFs

2. **Create a customer:**
   - Use the "Create Customer" request in the customers collection
   - Note the returned customer ID

3. **Create a product:**
   - Use the "Create Product" request in the products collection
   - Note the returned product ID

4. **Create an invoice:**
   - Use the "Create Invoice" request in the invoices collection
   - Update the `customerId` in the request body with the ID from step 2
   - For line items, you can either:
     - Provide just `productId` and `quantity` - the system will auto-fill `description` and `unitPrice` from the product
     - Provide custom `description` and `unitPrice` (set `productId` to `null`)
   - The invoice will be created with calculations (subtotal, VAT, total) done automatically

5. **Generate invoice PDF:**
   - Use the "Get Invoice PDF" request (if available in collection)
   - Or visit `http://localhost:3000/api/invoices/1/pdf` in your browser

## Example Request Bodies

### Create/Update Business Info
```json
{
  "companyName": "Your Company Name",
  "streetAddress": "123 Business Street",
  "city": "Johannesburg",
  "postalCode": "2000",
  "country": "South Africa",
  "vatNumber": "VAT4012345678",
  "email": "billing@yourcompany.com",
  "phone": "+27 11 123 4567",
  "logoPath": null,
  "accountHolderName": "Your Company Name",
  "bankName": "Standard Bank",
  "accountNumber": "123456789",
  "branchCode": "051001"
}
```

### Create Customer
```json
{
  "name": "Acme Corporation",
  "vatNumber": "VAT123456789",
  "streetAddress": "123 Main Street",
  "city": "Johannesburg",
  "postalCode": "2000",
  "country": "South Africa",
  "email": "contact@acme.com",
  "phone": "+27 11 123 4567"
}
```

### Create Product
```json
{
  "name": "Web Development Service",
  "description": "Full-stack web application development",
  "defaultPrice": 15000.00
}
```

### Create Invoice

**Option 1: Auto-fill from product (recommended)**
```json
{
  "customerId": 1,
  "dueDate": "2025-01-15",
  "vatRate": 15,
  "notes": "Thank you for your business!",
  "lineItems": [
    {
      "productId": 1,
      "quantity": 40.5
    },
    {
      "productId": null,
      "description": "Discount",
      "quantity": 1,
      "unitPrice": -500.00
    }
  ]
}
```

**Option 2: Full manual specification**
```json
{
  "customerId": 1,
  "dueDate": "2025-01-15",
  "vatRate": 15,
  "notes": "Thank you for your business!",
  "lineItems": [
    {
      "productId": null,
      "description": "Web Development - Landing Page",
      "quantity": 1,
      "unitPrice": 15000.00,
      "additionalNotes": "Responsive design included"
    }
  ]
}
```

## Notes

- All responses are in JSON format
- CORS is enabled for all origins (for development purposes)
- The API uses SQLite database (`invoices.db` in the project root)
- Invoice numbers are auto-generated in the format `INV-001`, `INV-002`, etc.
- Invoice calculations (subtotal, VAT, total) are done automatically on the server
- **Line Item Auto-Fill**: When creating invoices, you can provide just `productId` and `quantity` for line items. The system will automatically fetch and use the product's `name` as `description` and `defaultPrice` as `unitPrice`
- **PDF Generation**: Requires business info to be configured first. Generate PDFs by visiting `/api/invoices/:id/pdf`
