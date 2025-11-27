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
     - `customers.json` - Customer CRUD operations
     - `products.json` - Product CRUD operations
     - `invoices.json` - Invoice CRUD operations

3. **Base URL:**
   All collections use a variable `{{baseUrl}}` set to `http://localhost:3000`
   You can change this in Postman's environment settings if needed.

## Available Endpoints

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

## Testing Workflow

1. **Create a customer first:**
   - Use the "Create Customer" request in the customers collection
   - Note the returned customer ID

2. **Create a product:**
   - Use the "Create Product" request in the products collection
   - Note the returned product ID

3. **Create an invoice:**
   - Use the "Create Invoice" request in the invoices collection
   - Update the `customerId` and `productId` in the request body with the IDs from steps 1 and 2
   - The invoice will be created with line items and calculations (subtotal, VAT, total) done automatically

## Example Request Bodies

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
```json
{
  "customerId": 1,
  "dueDate": "2025-01-15",
  "vatRate": 15,
  "notes": "Thank you for your business!",
  "lineItems": [
    {
      "productId": 1,
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
