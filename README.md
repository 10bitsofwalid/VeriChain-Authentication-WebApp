# 🛡️ VeriChain

<div align="center">

# Trust Every Product

**Enterprise-grade Product Authenticity Verification, Supply Chain Traceability, and Verified Marketplace**

![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![MERN](https://img.shields.io/badge/Stack-MERN-success?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge)

</div>

---

# 📖 Overview

VeriChain is a full-stack Web Application that helps manufacturers, sellers, buyers, moderators, and administrators verify product authenticity, manage supply chains, and combat counterfeit goods.

## ✨ Highlights

- 🔐 JWT Authentication
- 🏭 Manufacturer Dashboard (Product template registration & batch generation)
- 🛒 Verified Marketplace (Listing, purchase, and ownership transfer)
- 📦 Supply Chain Tracking (Comprehensive tracking history for every item)
- 📱 Serial Number Verification (Public lookup page)
- 🛡️ Separate Moderator Control Center (Review disputes, verify manufacturers, manage flagged listings)
- 📊 Admin Control Center (Audit logs, invite admins/moderators, manage user statuses)

---

# 👥 User Roles

| Role      | Responsibilities                                                |
| --------- | --------------------------------------------------------------- |
| Buyer     | Verify authenticity, buy items, file disputes/complaints        |
| Seller    | Accept items, list items on marketplace                         |
| Factory   | Create product templates, generate item batches                 |
| Moderator | Verify product templates, resolve complaints, flag risky items  |
| Admin     | Verification of factories, invite system roles, view audit logs |

---

# 🏗️ Tech Stack

## Frontend

- React (v19)
- TypeScript
- Vite
- Axios
- Lucide React (Icons)
- Vitest & React Testing Library (Unit & Integration Testing)

## Backend

- Node.js & Express
- Mongoose (MongoDB ODM)
- TypeScript
- JWT & Bcryptjs (Authentication & Cryptography)
- Multer (File upload handler)
- Jest & Supertest (Integration Testing)

---

# 📂 Folder Structure

```text
VeriChain product authenticity webapp
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   └── tests
│   ├── public
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend
│   ├── src
│   │   ├── config
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   └── tests
│   └── package.json
└── README.md
```

---

# 🚀 Installation & Local Setup

## 1. Clone the Repository

```bash
git clone https://github.com/10bitsofwalid/VeriChain-Authentication-WebApp.git
cd "VeriChain product authenticity webapp"
```

## 2. Set Up Environment Variables

### Backend (`backend/.env`)

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb:
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY= 
CLOUDINARY_API_SECRET= 
```

### Frontend (`frontend/.env`)

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

## 3. Run the Services

### Start Backend

```bash
cd backend
npm install
npm run dev
```

The backend server will run on `http://localhost:5000`.

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend application will start on `http://localhost:5173`.

---

# 🧪 Running Tests

### Backend Tests

To run the Jest/Supertest backend suite:

```bash
cd backend
npm test
```

### Frontend Tests

To run the Vitest/React Testing Library suite:

```bash
cd frontend
npm test
```

---

# 📄 License

Distributed under the MIT License.

---

# 👨‍💻 Author

**Walid Rahman**

- GitHub: <https://github.com/10bitsofwalid>
- Portfolio: <https://walid-rahman-portfolio.vercel.app>
- LinkedIn: <https://www.linkedin.com/in/mohammad-walid-rahman>
