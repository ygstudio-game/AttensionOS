# AttentionOS Installation Guide

## Frontend Dependencies (Next.js)

```bash
cd frontend
pnpm install @mediapipe/tasks-vision @tensorflow/tfjs zustand react-use-gesture react-spring d3-scale d3-array
```

## Backend Dependencies (Node.js)

```bash
cd backend
pnpm install @tensorflow/tfjs-node sharp jimp
```

## Complete Installation Script

You can run this single command to install all dependencies:

```bash
# Install frontend dependencies
cd frontend && pnpm install @mediapipe/tasks-vision @tensorflow/tfjs zustand react-use-gesture react-spring d3-scale d3-array

# Install backend dependencies  
cd ../backend && pnpm install @tensorflow/tfjs-node sharp jimp
```

## Alternative: Install All at Once

If you prefer to install everything from the root directory:

```bash
# Frontend
pnpm --prefix frontend install @mediapipe/tasks-vision @tensorflow/tfjs zustand react-use-gesture react-spring d3-scale d3-array

# Backend
pnpm --prefix backend install @tensorflow/tfjs-node sharp jimp
```

## Required System Dependencies

For `@tensorflow/tfjs-node` to work properly, you may need:

### Windows
```bash
# Install Python (if not already installed)
# Install Windows Build Tools
npm install -g windows-build-tools
```

### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

### Linux
```bash
# Install build essentials
sudo apt-get install build-essential
```

## Verification

After installation, verify the packages are installed:

```bash
# Check frontend packages
cd frontend && pnpm list | grep -E "(mediapipe|tensorflow|zustand|react-spring)"

# Check backend packages  
cd backend && pnpm list | grep -E "(tensorflow|sharp|jimp)"
```

## Running the Project

```bash
# Start backend
cd backend && pnpm dev

# Start frontend (in a new terminal)
cd frontend && pnpm dev
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:5000`.