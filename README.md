# 🎧 Mini-Com: High-Performance Resilient Payment Orchestrator

Mini-Com is a state-of-the-art payment orchestration platform designed for modern commerce. Built with a focus on reliability, scalability, and robust error handling, it demonstrates advanced patterns like Idempotency, Concurrency Control, and Circuit Breakers.

---

## 📂 Project Structure

- **`/frontend`**: React + Vite + TypeScript. A premium, high-end UI for browsing products and managing payment sessions.
- **`/backend`**: Node.js + Express + TypeScript. A layered architecture (Controller-Service-Repository) for secure payment orchestration.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)
- Razorpay Account (For Test Keys)

### 2. Backend Setup
```bash
cd backend
npm install
```
**Configure Environment Variables:**
Create a `.env` file in the `/backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```
**Run Backend:**
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
**Configure Environment Variables:**
Create a `.env` file in the `/frontend` folder:
```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```
**Run Frontend:**
```bash
npm run dev
```

---

## 🛠️ Measures Taken for Robustness (Problem Solving)

To solve the complex challenges of distributed payment systems, the following measures were implemented:

### 🛡️ 1. Idempotency (Duplicate Prevention)
Ensures that even if a user clicks "Pay" multiple times or a network retry occurs, the system never processes the same payment twice. This is achieved via a unique `idempotencyKey` per session.

### 🔐 2. Concurrency Control (Atomic Locking)
Using MongoDB's atomic `findOneAndUpdate` operations, we ensure that a single payment can only be processed by one thread at a time, effectively preventing race conditions during verification.

### ⚡ 3. Circuit Breaker Pattern
Protects the system from cascading failures. If the external gateway (Bank/Simulator) is down, the Circuit Breaker "trips," fast-failing requests instead of letting them hang and exhaust system resources.

### 🔄 4. Exponential Backoff Retries
When transient failures occur (timeouts, network blips), the system automatically retries with increasing delays (e.g., 2s, 4s, 8s), maximizing the chance of success without overloading the gateway.

### ⏳ 5. 10-Minute Payment Sessions
Each payment has a dedicated session page with a unique ID (`MINICOM-XXXX`). The session remains active for 10 minutes, allowing users to retry failed attempts directly from the status page.

---

## 🧪 Simulation & Testing
The system includes a **Payment Simulator** that mimics real-world conditions like random delays, timeouts (10%), and failures (20%). 

To verify the logic without a frontend, run the backend simulation test:
```bash
cd backend
npm run test:simulate
```

---

## 🏗️ Architecture
The backend follows a **Layered Architecture**:
- **Controllers**: Handle HTTP requests/responses.
- **Services**: Contain business logic and orchestrate retries/logic.
- **Repositories**: Direct data access with atomic safety.

---
**Developed with focus on Resilience and Scalability.**
