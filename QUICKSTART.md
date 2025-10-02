# Quick Start Guide

This guide will help you get AlphaOPT running in just a few minutes.

## Prerequisites

- Python 3.8+ installed
- Node.js 14+ and npm installed

## Step 1: Start the Backend (Terminal 1)

```bash
# Navigate to the API directory
cd api

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Run the Flask server
python app.py
```

✅ You should see: `Running on http://127.0.0.1:5000`

## Step 2: Start the Frontend (Terminal 2)

Open a **new terminal window** and run:

```bash
# Install dependencies (first time only)
npm install

# Start the React app
npm start
```

✅ Your browser should automatically open to `http://localhost:3000`

## Testing the API

You can test the API independently:

```bash
# Health check
curl http://localhost:5000/api/health

# Get sample problems
curl http://localhost:5000/api/problems

# Solve a problem
curl -X POST http://localhost:5000/api/solve \
  -H "Content-Type: application/json" \
  -d '{"problem": "I need to maximize profit from two products..."}'
```

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'flask'`
- **Solution**: Make sure you activated the virtual environment and installed dependencies

**Problem**: `Address already in use`
- **Solution**: Port 5000 is busy. Kill the process or change the port in `api/app.py`

### Frontend Issues

**Problem**: Frontend can't connect to API
- **Solution**: 
  1. Make sure the backend is running on port 5000
  2. Check the browser console for CORS errors
  3. Verify `REACT_APP_API_URL` in `.env` (if you created one)

**Problem**: `npm: command not found`
- **Solution**: Install Node.js from https://nodejs.org/

## Development Tips

- The Flask server will auto-reload when you change Python files
- The React app will hot-reload when you change JS/CSS files
- Use `Ctrl+C` in each terminal to stop the servers

## Next Steps

1. Try the sample problems in the UI
2. Describe your own optimization problem
3. Check `api/app.py` to see where dummy data is returned
4. Later: Replace dummy data with actual solver logic

Enjoy using AlphaOPT! 🚀

