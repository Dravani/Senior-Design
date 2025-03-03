# Senior Design Project

This repository contains the code for our Senior Design project. The project is split into two parts:

- **Frontend:** Built using Vite (with React or your chosen framework).
- **Backend:** Built using Node.js and Express.

Both parts can be run concurrently from the project root.

## Project Structure

```
senior-design/
├── frontend/  # Frontend application (React + Vite)
├── backend/   # Backend application (Node.js + Express)
├── package.json
└── README.md
```

## Prerequisites

- **Node.js** (v20.14.0 or later is recommended)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Dravani/Senior-Design.git
   cd senior-design
   ```

2. **Install dependencies:**

   For the frontend:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

   For the backend:
   ```bash
   cd backend
   npm install
   cd ..
   ```

## Environment Configuration (Backend)

In the `backend` folder, create a `.env` file to set environment variables. For example:

```ini
PORT=3001
# Add other variables as needed (e.g., DB_URL, SECRET_KEY, etc.)
```

> **Note:** The `.env` file is ignored by Git (see `.gitignore`), so your sensitive data stays private.

## Running the Project

We use `concurrently` to run both the frontend and backend simultaneously from the root directory.

### Start both servers

From the root folder, run:

```bash
npm run dev
```

This command will execute:

- `npm run dev --prefix frontend` (to start the Vite development server)
- `npm run dev --prefix backend` (to start the Node.js backend server using nodemon)

### Access the application

- **Frontend:** Available at `http://localhost:5173`
- **Backend:** API available at `http://localhost:3001/api`.

## Additional Scripts

### Run Frontend Only

```bash
cd frontend
npm run dev
```

### Run Backend Only

```bash
cd backend
npm run dev
