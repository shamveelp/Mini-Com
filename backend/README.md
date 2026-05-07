# Mini-Com API Documentation

## Base URL
`http://localhost:5000/api`

## Endpoints

### 1. Products
*   **GET `/products`**
    *   Description: Retrieve all premium products.
    *   Response: `200 OK` with array of products.

*   **GET `/products/:id`**
    *   Description: Retrieve a specific product by ID.
    *   Response: `200 OK` or `404 Not Found`.

### 2. Payments
*   **POST `/orders`**
    *   Description: Initiate a payment process and create a Razorpay order.
    *   Rate Limit: 5 requests per minute.
    *   Body:
        ```json
        {
          "amount": number,
          "currency": "INR",
          "idempotencyKey": "unique_string"
        }
        ```
    *   Response: `200 OK` with Razorpay order details.

*   **POST `/verify`**
    *   Description: Verify payment signature and process through the external gateway with retry logic.
    *   Body:
        ```json
        {
          "razorpay_order_id": "string",
          "razorpay_payment_id": "string",
          "razorpay_signature": "string"
        }
        ```
    *   Response: `200 OK` (Success) or `400/500` (Failure).

*   **POST `/webhook`**
    *   Description: Asynchronous updates from Razorpay.
    *   Headers: `x-razorpay-signature`
    *   Response: `200 OK`.

## Resilience Patterns
*   **Idempotency**: Prevents duplicate charges via `idempotencyKey`.
*   **Circuit Breaker**: Protects against external gateway cascading failures.
*   **Retry Logic**: Exponential backoff (max 3 attempts).
*   **Concurrency Control**: Atomic state transitions via MongoDB.
