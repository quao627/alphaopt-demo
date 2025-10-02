# AlphaOPT FastAPI Backend

FastAPI backend with automatic Swagger/OpenAPI documentation.

## Installation

```bash
cd api
pip install -r requirements.txt
```

## Run the Server

```bash
python app.py
```

Or with uvicorn directly:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

## API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Endpoints

### GET `/api/problems`
Get all sample optimization problems

### POST `/api/solve`
Solve an optimization problem
- **Request Body**: `{"problem": "problem description"}`
- **Response**: Returns insights, formulation, code, and solution

### GET `/api/health`
Health check endpoint

## Features

✅ Built-in Swagger UI documentation  
✅ Request/response validation with Pydantic  
✅ CORS enabled for frontend integration  
✅ Async endpoints for better performance  
✅ Type hints and auto-completion support
