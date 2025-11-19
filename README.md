# E2E Chat Webapp

A complete React web application with MongoDB integration demonstrating the chatly-sdk.

## Features

- ✅ React frontend with modern UI
- ✅ MongoDB backend with adapters
- ✅ WebSocket real-time messaging
- ✅ End-to-end encryption
- ✅ 1:1 and group chat support

## Prerequisites

- Node.js 18+
- MongoDB running locally or connection string
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
# Install SDK dependencies (from root)
cd ..
npm install

# Build SDK
npm run build

# Install backend dependencies
cd webapp/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure MongoDB

Create a `.env` file in `webapp/backend/`:

```env
PORT=3001
WS_PORT=3002
MONGODB_URI=mongodb://localhost:27017
DB_NAME=chatdb
```

Or use MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatdb
```

### 3. Start MongoDB

If using local MongoDB:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 mongo
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd webapp/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd webapp/frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3002

## Usage

1. Open http://localhost:5173 in your browser
2. Enter a username to login
3. The app will create a user and connect via WebSocket
4. To test with multiple users, open multiple browser windows/incognito tabs
5. Select a contact to start chatting
6. Messages are end-to-end encrypted

## Project Structure

```
webapp/
├── backend/
│   ├── adapters/          # MongoDB adapters for SDK
│   │   ├── mongodbUserStore.ts
│   │   ├── mongodbMessageStore.ts
│   │   ├── mongodbGroupStore.ts
│   │   └── websocketTransport.ts
│   ├── api/               # REST API routes
│   │   └── users.js
│   └── server.js          # Express + WebSocket server
│
└── frontend/
    ├── src/
    │   ├── components/    # React components
    │   │   ├── Login.tsx
    │   │   ├── ChatView.tsx
    │   │   ├── ChatList.tsx
    │   │   ├── MessageList.tsx
    │   │   └── MessageInput.tsx
    │   ├── adapters/      # Frontend adapters
    │   │   └── websocketTransport.ts
    │   └── App.tsx        # Main app component
    └── vite.config.ts
```

## Architecture

### Backend
- **Express.js** server for REST API
- **WebSocket** server for real-time messaging
- **MongoDB** adapters implementing SDK store interfaces
- SDK initialized with MongoDB collections

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- SDK with in-memory stores (for demo) or API calls
- WebSocket transport for real-time updates
- Modern, responsive UI

## MongoDB Collections

The app creates three collections:
- `users` - User data with identity keys
- `messages` - Encrypted messages
- `groups` - Group information

## Development

### Adding Features

1. **New API endpoints**: Add to `backend/api/`
2. **New components**: Add to `frontend/src/components/`
3. **Database changes**: Update adapters in `backend/adapters/`

### Testing

To test with multiple users:
1. Open app in multiple browser windows
2. Login with different usernames
3. Messages are encrypted end-to-end

## Troubleshooting

**MongoDB connection error:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access if using Atlas

**WebSocket connection failed:**
- Check WS_PORT in backend
- Ensure CORS is configured
- Check browser console for errors

**SDK not initialized:**
- Verify MongoDB connection
- Check backend logs
- Ensure collections exist

## Production Deployment

1. Build frontend: `cd frontend && npm run build`
2. Serve static files from Express
3. Use environment variables for all configs
4. Enable HTTPS for WebSocket (WSS)
5. Use MongoDB Atlas or managed database
6. Add authentication/authorization
7. Implement rate limiting
8. Add error monitoring



