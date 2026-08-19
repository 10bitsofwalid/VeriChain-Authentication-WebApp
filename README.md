# 🛡️ VeriChain

<div align="center">

# Trust Every Product

**Enterprise-grade Product Authenticity Verification, Supply Chain Traceability, and Verified Marketplace**

![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![MERN](https://img.shields.io/badge/Stack-MERN-success?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

</div>

---

## 📖 Overview

VeriChain is a full-stack Web Application that helps manufacturers, sellers, buyers, moderators, and administrators verify product authenticity, manage supply chains, and combat counterfeit goods.

### ✨ Highlights

- 🔐 JWT Authentication & Multi-Role Authorization (Buyer, Seller, Factory, Moderator, Admin)
- 🏭 Manufacturer Dashboard (Product template registration & serialized batch generation)
- 🛒 Verified Marketplace (Real-time listing, purchasing, and atomic ownership transfer)
- 📦 Supply Chain Tracking (Comprehensive immutable tracking history for every item)
- 📱 Serial Number Verification (Instant public lookup and authenticity certificates)
- 🛡️ Moderator Control Center (Review disputes, verify manufacturers, manage flagged listings)
- 📊 Admin Control Center (Audit logs, role management, invitation dispatch)

---

## 👥 User Roles

| Role      | Responsibilities                                                |
| --------- | --------------------------------------------------------------- |
| Buyer     | Verify authenticity, buy items, file disputes/complaints        |
| Seller    | Accept items, list items on marketplace, fulfill orders         |
| Factory   | Create product templates, generate serialized item batches      |
| Moderator | Verify product templates, resolve complaints, flag risky items  |
| Admin     | Verification of factories, invite system roles, view audit logs |

---

## 🏗️ Tech Stack

### Frontend
- React (v19)
- TypeScript
- Vite
- Axios
- Tabler Icons React
- Vitest & React Testing Library (Unit & Integration Testing)

### Backend
- Node.js & Express
- Mongoose (MongoDB Atlas ODM)
- TypeScript
- JWT & Bcryptjs (Authentication & Cryptography)
- Multer & Cloudinary (File upload handler)
- Jest & Supertest (Integration Testing)

---

## 📂 Folder Structure

```text
VeriChain product authenticity webapp
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── pages
│   │   ├── tests
│   │   ├── types
│   │   └── utils
│   ├── public
│   ├── index.html
│   ├── vercel.json
│   ├── vite.config.ts
│   └── package.json
├── backend
│   ├── src
│   │   ├── config
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── tests
│   │   └── utils
│   └── package.json
├── vercel.json
└── README.md
```

---

## 🚀 Installation & Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/10bitsofwalid/VeriChain-Authentication-WebApp.git
cd "VeriChain product authenticity webapp"
```

### 2. Set Up Environment Variables

#### Backend (`backend/.env`)
Copy the template from `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/verichain?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Cloudinary Media Storage (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend (`frontend/.env`)
Copy the template from `frontend/.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Services

#### Start Backend
```bash
cd backend
npm install
npm run dev
```
The backend server will run on `http://localhost:5000`.

#### Start Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend application will start on `http://localhost:5173`.

---

## 🌐 Deploying to Vercel

The project includes pre-configured `vercel.json` files at the repository root and in `frontend/` with full SPA route rewrites (`/(.*)` -> `/index.html`) so client-side routing works seamlessly without 404 errors on page refreshes.

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (or select `frontend` if deploying frontend only)
   - **Build Command**: `cd frontend && npm run build` (automatic with root `vercel.json`)
   - **Output Directory**: `frontend/dist` (automatic with root `vercel.json`)
5. Add Environment Variables in Vercel Settings:
   - `VITE_API_URL`: `https://your-deployed-backend.com/api`
6. Click **Deploy**.

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from repository root
vercel

# Deploy to production
vercel --prod
```

> [!TIP]
> Ensure your deployed backend allows the Vercel domain in `ALLOWED_ORIGINS` in your backend environment configuration to prevent CORS issues.

---

## 🧪 Running Tests

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

## 📄 License

Distributed under the MIT License.

---

## 👨‍💻 Author

**Walid Rahman**
- GitHub: [10bitsofwalid](https://github.com/10bitsofwalid)
- Portfolio: [walid-rahman-portfolio.vercel.app](https://walid-rahman-portfolio.vercel.app)
- LinkedIn: [mohammad-walid-rahman](https://www.linkedin.com/in/mohammad-walid-rahman)
