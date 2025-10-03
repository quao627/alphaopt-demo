from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import time

app = FastAPI(
    title="AlphaOPT API",
    description="API for optimization problem solving with insights",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Problem(BaseModel):
    id: int
    title: str
    description: str

class ProblemRequest(BaseModel):
    problem: str = Field(..., description="Problem description to solve")
    regenerate: bool = Field(default=False, description="Whether this request is triggered by regenerate")

class Insight(BaseModel):
    category: str
    taxonomy: str
    condition: str
    explanation: str
    example: str

class InsightsResponse(BaseModel):
    insights: List[Insight]

class FormulationResponse(BaseModel):
    formulation: str

class CodeResponse(BaseModel):
    code: str

class SolutionOnlyResponse(BaseModel):
    solution: Dict[str, Any]

class SolutionResponse(BaseModel):
    insights: List[Insight]
    formulation: str
    code: str
    solution: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    message: str

# Sample problems data
SAMPLE_PROBLEMS = [
    {
        "id": 1,
        "title": "Production Planning",
        "description": "A factory produces two products. Product A requires 2 hours of labor and 3 units of material, while Product B requires 3 hours of labor and 2 units of material. The factory has 100 hours of labor and 90 units of material available. Product A sells for $50 and Product B sells for $60. How many of each product should be produced to maximize profit?"
    },
    {
        "id": 2,
        "title": "Transportation Problem",
        "description": "A company has 3 warehouses with supplies of 100, 150, and 200 units respectively. They need to ship to 4 customers who demand 80, 90, 110, and 70 units. The shipping costs vary by route. What is the optimal shipping plan to minimize total cost?"
    },
    {
        "id": 3,
        "title": "Portfolio Optimization",
        "description": "An investor wants to allocate funds across 5 different stocks to maximize expected return while keeping risk below a certain threshold. Each stock has different expected returns and volatility. What is the optimal portfolio allocation?"
    },
]

@app.get("/api/problems", response_model=List[Problem], tags=["Problems"])
async def get_problems():
    """Get all sample optimization problems"""
    return SAMPLE_PROBLEMS

@app.post("/api/solve", response_model=SolutionResponse, tags=["Solver"])
async def solve_problem(request: ProblemRequest):
    """
    Solve an optimization problem and return insights, formulation, code, and solution
    """
    if not request.problem:
        raise HTTPException(status_code=400, detail="Problem description is required")
    
    # Simulate processing time
    time.sleep(1.5)
    
    # Return dummy response (to be replaced with actual solver later)
    return {
        "insights": [
            {
                "category": "domain",
                "taxonomy": "Problem Type",
                "condition": "Linear objective and constraints",
                "explanation": "This is a classic linear programming problem with a linear objective function and linear constraints. The problem exhibits properties that make it suitable for simplex or interior-point methods.",
                "example": "max c^T x subject to Ax ≤ b, x ≥ 0"
            },
            {
                "category": "formulation",
                "taxonomy": "Variable Bounds",
                "condition": "Non-negative continuous variables",
                "explanation": "Decision variables represent production quantities which must be non-negative. Continuous variables are appropriate since fractional production units can be manufactured.",
                "example": "x₁, x₂ ≥ 0 where x₁, x₂ ∈ ℝ"
            },
            {
                "category": "domain",
                "taxonomy": "Resource Allocation",
                "condition": "Limited resources with competing demands",
                "explanation": "The problem involves allocating scarce resources (labor and material) across multiple products. Each resource has a fixed capacity that cannot be exceeded.",
                "example": "100 hours of labor, 90 units of material"
            },
            {
                "category": "code",
                "taxonomy": "Solver Selection",
                "condition": "Gurobi for LP problems",
                "explanation": "Gurobi is highly efficient for linear programming problems of this scale. The simplex or barrier algorithm will find the optimal solution quickly.",
                "example": "model = gp.Model('production'); model.optimize()"
            },
            {
                "category": "formulation",
                "taxonomy": "Constraint Structure",
                "condition": "All constraints are inequalities",
                "explanation": "Using ≤ constraints is standard for resource limitations. This form allows slack variables to represent unused resources in the optimal solution.",
                "example": "2x₁ + 3x₂ ≤ 100"
            },
            {
                "category": "domain",
                "taxonomy": "Profit Maximization",
                "condition": "Linear profit per unit",
                "explanation": "The objective assumes constant profit margins per unit, which is typical for production planning. No economies of scale or volume discounts are considered.",
                "example": "Profit = $50 × units_A + $60 × units_B"
            }
        ],
        "formulation": """Maximize: 50x₁ + 60x₂

Subject to:
  2x₁ + 3x₂ ≤ 100  (labor constraint)
  3x₁ + 2x₂ ≤ 90   (material constraint)
  x₁, x₂ ≥ 0       (non-negativity)

Where:
  x₁: units of Product A
  x₂: units of Product B""",
        "code": """import gurobipy as gp
from gurobipy import GRB

# Create model
model = gp.Model("production_planning")

# Decision variables
x1 = model.addVar(name="Product_A", lb=0)
x2 = model.addVar(name="Product_B", lb=0)

# Objective function
model.setObjective(50*x1 + 60*x2, GRB.MAXIMIZE)

# Constraints
model.addConstr(2*x1 + 3*x2 <= 100, "labor")
model.addConstr(3*x1 + 2*x2 <= 90, "material")

# Solve
model.optimize()

# Results
if model.status == GRB.OPTIMAL:
    print(f"Product A: ${x1.X:.2f} units")
    print(f"Product B: ${x2.X:.2f} units")
    print(f"Maximum Profit: $${model.objVal:.2f}")""",
        "solution": {
            "status": "Optimal",
            "variables": {
                "Product A (x₁)": "12.00 units",
                "Product B (x₂)": "25.33 units"
            },
            "objective": "$2,120.00",
            "details": "The optimal solution produces 12 units of Product A and approximately 25.33 units of Product B, yielding a maximum profit of $2,120."
        }
    }

@app.post("/api/solve/insights", response_model=InsightsResponse, tags=["Solver"])
async def get_insights(request: ProblemRequest):
    """
    Step 1: Generate insights for the optimization problem
    """
    if not request.problem:
        raise HTTPException(status_code=400, detail="Problem description is required")
    
    # Simulate processing time
    time.sleep(0.8)
    
    return {
        "insights": [
            {
                "category": "domain",
                "taxonomy": "Problem Type",
                "condition": "Linear objective and constraints",
                "explanation": "This is a classic linear programming problem with a linear objective function and linear constraints. The problem exhibits properties that make it suitable for simplex or interior-point methods.",
                "example": "max c^T x subject to Ax ≤ b, x ≥ 0"
            },
            {
                "category": "formulation",
                "taxonomy": "Variable Bounds",
                "condition": "Non-negative continuous variables",
                "explanation": "Decision variables represent production quantities which must be non-negative. Continuous variables are appropriate since fractional production units can be manufactured.",
                "example": "x₁, x₂ ≥ 0 where x₁, x₂ ∈ ℝ"
            },
            {
                "category": "domain",
                "taxonomy": "Resource Allocation",
                "condition": "Limited resources with competing demands",
                "explanation": "The problem involves allocating scarce resources (labor and material) across multiple products. Each resource has a fixed capacity that cannot be exceeded.",
                "example": "100 hours of labor, 90 units of material"
            },
            {
                "category": "code",
                "taxonomy": "Solver Selection",
                "condition": "Gurobi for LP problems",
                "explanation": "Gurobi is highly efficient for linear programming problems of this scale. The simplex or barrier algorithm will find the optimal solution quickly.",
                "example": "model = gp.Model('production'); model.optimize()"
            },
            {
                "category": "formulation",
                "taxonomy": "Constraint Structure",
                "condition": "All constraints are inequalities",
                "explanation": "Using ≤ constraints is standard for resource limitations. This form allows slack variables to represent unused resources in the optimal solution.",
                "example": "2x₁ + 3x₂ ≤ 100"
            },
            {
                "category": "domain",
                "taxonomy": "Profit Maximization",
                "condition": "Linear profit per unit",
                "explanation": "The objective assumes constant profit margins per unit, which is typical for production planning. No economies of scale or volume discounts are considered.",
                "example": "Profit = $50 × units_A + $60 × units_B"
            }
        ]
    }

@app.post("/api/solve/formulation", response_model=FormulationResponse, tags=["Solver"])
async def get_formulation(request: ProblemRequest):
    """
    Step 2: Generate mathematical formulation for the optimization problem
    """
    if not request.problem:
        raise HTTPException(status_code=400, detail="Problem description is required")
    
    # Simulate processing time
    time.sleep(0.6)
    
    return {
        "formulation": """Maximize: 50x₁ + 60x₂

Subject to:
  2x₁ + 3x₂ ≤ 100  (labor constraint)
  3x₁ + 2x₂ ≤ 90   (material constraint)
  x₁, x₂ ≥ 0       (non-negativity)

Where:
  x₁: units of Product A
  x₂: units of Product B"""
    }

@app.post("/api/solve/code", response_model=CodeResponse, tags=["Solver"])
async def get_code(request: ProblemRequest):
    """
    Step 3: Generate code implementation for the optimization problem
    """
    if not request.problem:
        raise HTTPException(status_code=400, detail="Problem description is required")
    
    # Simulate processing time
    time.sleep(0.7)
    
    return {
        "code": """import gurobipy as gp
from gurobipy import GRB

# Create model
model = gp.Model("production_planning")

# Decision variables
x1 = model.addVar(name="Product_A", lb=0)
x2 = model.addVar(name="Product_B", lb=0)

# Objective function
model.setObjective(50*x1 + 60*x2, GRB.MAXIMIZE)

# Constraints
model.addConstr(2*x1 + 3*x2 <= 100, "labor")
model.addConstr(3*x1 + 2*x2 <= 90, "material")

# Solve
model.optimize()

# Results
if model.status == GRB.OPTIMAL:
    print(f"Product A: ${x1.X:.2f} units")
    print(f"Product B: ${x2.X:.2f} units")
    print(f"Maximum Profit: $${model.objVal:.2f}")"""
    }

@app.post("/api/solve/solution", response_model=SolutionOnlyResponse, tags=["Solver"])
async def get_solution(request: ProblemRequest):
    """
    Step 4: Generate solution for the optimization problem
    """
    if not request.problem:
        raise HTTPException(status_code=400, detail="Problem description is required")
    
    # Simulate processing time
    time.sleep(0.9)
    
    return {
        "solution": {
            "status": "Optimal",
            "variables": {
                "Product A (x₁)": "12.00 units",
                "Product B (x₂)": "25.33 units"
            },
            "objective": "$2,120.00",
            "details": "The optimal solution produces 12 units of Product A and approximately 25.33 units of Product B, yielding a maximum profit of $2,120."
        }
    }

@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint to verify API status"""
    return {"status": "healthy", "message": "AlphaOPT API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
