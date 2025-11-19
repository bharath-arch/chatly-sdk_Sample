# Quick Start Guide

## 1. Build the SDK

```bash
cd ..
npm install
npm run build
```

## 2. Start MongoDB

```bash
# Option 1: Local MongoDB
mongod

# Option 2: Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Option 3: MongoDB Atlas (update .env with connection string)
```

## 3. Setup Backend

```bash
cd webapp/backend
npm install

# Create .env file
echo "PORT=3001
WS_PORT=3002
MONGODB_URI=mongodb://localhost:27017
DB_NAME=chatdb" > .env

# Start backend
npm run dev
```

## 4. Setup Frontend

```bash
cd webapp/frontend
npm install
npm run dev
```

## 5. Open Browser

Open http://localhost:5173 and start chatting!

## Testing with Multiple Users

1. Open http://localhost:5173 in one browser
2. Open http://localhost:5173 in an incognito window
3. Login with different usernames
4. Select each other as contacts
5. Send encrypted messages!

