# MERN GenAI Career Coach

A full-stack web application designed to help users prepare for their careers using Generative AI. It includes resume parsing, interview preparation, and other career coaching features.

## Project Structure

This project is a monorepo containing both the frontend and backend applications.

- `/Frontend`: A React application built with Vite.
- `/Backend`: A Node.js/Express server providing the API and integrating with AI services (Google GenAI, Groq).

## Technologies Used

### Frontend
- React 19
- React Router 7
- Vite
- Sass for styling
- Axios for API requests

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for authentication
- Multer & pdf-parse for resume handling
- Google GenAI & Groq SDKs for AI features
- Nodemailer for email services

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd mern-genai-career-coach
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd Backend
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../Frontend
    npm install
    ```

### Environment Variables

You need to create a `.env` file in the `Backend` directory. You will need API keys for Google GenAI, Groq, and a MongoDB connection string.

**Backend (`Backend/.env`)**
Create a file named `.env` in the `Backend` directory and add the necessary environment variables. (e.g., `PORT`, `MONGO_URI`, `JWT_SECRET`, `GOOGLE_GEMINI_API_KEY`, `GROQ_API_KEY`, email credentials, etc.).

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd Backend
    npm run dev
    ```
    The server will typically start on `http://localhost:5000` (or the port specified in your `.env`).

2.  **Start the Frontend Development Server:**
    Open a new terminal window/tab:
    ```bash
    cd Frontend
    npm run dev
    ```
    The Vite development server will start, usually on `http://localhost:5173`. Open this URL in your browser.

## Features

- User Authentication (Registration/Login)
- AI-Powered Resume Analysis
- Mock Interview Preparation
- (Add any other specific features here based on your implementation)
