# Coupon Management Backend (Assignment B)

A simple Node.js + Express backend that allows:

- Creating coupons  
- Listing all coupons  
- Finding the best coupon for a user + cart  
- Tracking usage of a coupon  

This project fulfills **Assignment B – Coupon Management System**.

## Tech Stack
- **Node.js**
- **Express**
- **Dayjs** (for dates)
- **Nodemon** (for development)

##  How to Run the Project Locally

### 1. Install dependencies  
Open terminal inside the project folder and run:

npm install

bash
Copy code

### 2. Start the server  
npm run dev

yaml
Copy code

You should see:

Server listening on port 3000

shell
Copy code

### 3. Seed sample coupon (optional)
Send a POST request:

POST http://localhost:3000/seed

yaml
Copy code

This adds a coupon: **WELCOME100**.

---

## API Endpoints

### POST /coupons  
Create a new coupon  
Body example:
```json
{
  "code": "FEST50",
  "description": "50% off",
  "discountType": "PERCENT",
  "discountValue": 50,
  "maxDiscountAmount": 1000,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
 GET /coupons
Returns all coupons.

 POST /best-coupon
Finds the best coupon based on user + cart.

Body example:

json
Copy code
{
  "user": {
    "userId": "u123",
    "userTier": "NEW",
    "ordersPlaced": 0
  },
  "cart": {
    "items": [
      { "unitPrice": 1500, "quantity": 1 }
    ]
  }
}
 POST /apply-coupon
Increments usage of a coupon.

## Notes
Coupons are stored in memory (reset when server restarts).

Duplicate coupon codes are not allowed.

Implements assignment rules for discount types, eligibility, cart value, and usage limits.

@ Seed User (Given in assignment)
vbnet
Copy code
email: hire-me@anshumat.org
password: HireMe@2025!
### AI / Tools Used
ChatGPT was used for debugging and guidance.