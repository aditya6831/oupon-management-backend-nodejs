# Coupon Management Backend System:

## Tech Stack
- Node.js
- Express.js
- MongoDB
- REST APIs

## Features
- Create and validate discount coupons
- Coupon expiry and usage limits
- Eligibility logic
- Secure API structure

## How to Run
1. Clone the repo
2. npm install
3. npm start

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



## Author
Aditya Renguntwar
