# AlphaOPT

A modern, minimalist application for solving optimization problems using natural language descriptions.

## Features

- 🎯 **Clean Chat Interface**: Describe optimization problems in natural language
- 📐 **Mathematical Formulation**: Automatically generates mathematical formulations
- 💻 **Python Code Generation**: Produces Gurobi-based Python code
- 🎨 **Modern UI**: Bright, minimalist design with smooth animations
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- ⚡ **Sample Problems**: Quick-start with pre-configured optimization scenarios
- 🔌 **Flask API Backend**: RESTful API for problem solving

## Getting Started

### Backend Setup (Flask API)

1. Navigate to the API directory:
```bash
cd api
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The API will be available at [http://localhost:5000](http://localhost:5000)

### Frontend Setup (React)

1. Install dependencies:
```bash
npm install
```

2. (Optional) Configure API URL by creating a `.env` file:
```bash
REACT_APP_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm build
```

## Architecture

```
.
├── api/                        # Flask Backend
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # API documentation
│
├── src/                        # React Frontend
│   ├── components/
│   │   ├── ChatInterface.js   # Main chat UI with message handling
│   │   ├── ChatInterface.css
│   │   ├── Message.js         # Individual message component
│   │   ├── Message.css
│   │   ├── ProblemSelector.js # Landing page with sample problems
│   │   └── ProblemSelector.css
│   ├── App.js                 # Main application component
│   ├── App.css
│   ├── index.js               # Application entry point
│   └── index.css              # Global styles
│
├── public/                    # Static assets
└── package.json               # Node.js dependencies
```

## API Endpoints

### GET `/api/health`
Health check endpoint

### GET `/api/problems`
Returns all sample optimization problems

### POST `/api/solve`
Solves an optimization problem
- Request body: `{ "problem": "problem description" }`
- Response: `{ "formulation": "...", "code": "...", "solution": {...} }`

## Usage

1. **Choose a Sample Problem**: Select from pre-configured optimization scenarios
2. **Or Describe Your Own**: Type a custom optimization problem description
3. **View Results**: Get mathematical formulation, Python code, and optimal solution
4. **Follow Up**: Ask questions or modify the problem in the chat interface

## Tech Stack

### Frontend
- **React 18** - UI framework
- **JavaScript** - Programming language
- **CSS3** - Styling with modern features
- **Inter Font** - Clean, professional typography

### Backend
- **Flask 3.0** - Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Python 3.x** - Backend language

## Design Principles

- **Minimalism**: Clean, uncluttered interface
- **Bright & Modern**: Light color scheme with purple accent gradients
- **Responsive**: Mobile-first approach
- **Accessibility**: Clear typography and intuitive interactions
- **Performance**: Optimized for fast rendering and smooth animations

## Future Enhancements

- ✅ Backend API integration (completed)
- Actual optimization solver integration (Gurobi/PuLP)
- Code export functionality
- Problem history and saved problems
- Multiple solver support (beyond Gurobi)
- Visualization of solutions
- User authentication and saved sessions

## License

MIT

