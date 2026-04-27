# Seva-Setu

Seva-Setu is a modern, responsive disaster relief management dashboard built with React and Tailwind CSS.

## Running the code

### Frontend
1. Run `npm i` to install dependencies.
2. Run `npm run dev` to start the development server.

### Backend (Database)
1. Open a new terminal and navigate to the `server` directory: `cd server`
2. Install dependencies: `npm i`
3. **Environment Setup**: 
   - Rename `.env.example` to `.env`
   - Open `.env` and replace the `MONGODB_URI` placeholder with your own MongoDB Atlas connection string.
4. Start the server: `node index.js`

The backend runs on `http://localhost:5000` and handles report storage and urgency scoring via MongoDB.