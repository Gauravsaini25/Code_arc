from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os

from .ingestion import scan_codebase
from .parsing import JavaParser
from .graph.builder import GraphBuilder
from .embeddings.processor import EmbeddingProcessor
from .clustering.engine import ClusteringEngine

app = FastAPI(title="AI Code Archaeologist")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State (MVP specific)
STATE = {
    "graph": None,
    "graph_data": None,
    "clusters": None,
    "status": "IDLE"
}

class AnalysisRequest(BaseModel):
    path: str
    language: str = "java"

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze_codebase(req: AnalysisRequest):
    debug_path = r"C:\project\BTP_Code_Archeologist\debug_output.txt"
    try:
        with open(debug_path, "a") as f:
            f.write(f"Analyze called for {req.path}\n")
    except:
        pass

    global STATE
    if STATE["status"] == "PROCESSING":
        raise HTTPException(status_code=400, detail="Already processing")
    
    STATE["status"] = "PROCESSING"
    
    try:
        # 1. Ingest
        print(f"Scanning {req.path}...", flush=True)
        files = scan_codebase(req.path, req.language)
        print(f"Found {len(files)} files.", flush=True)

        # 2. Parse
        print("Parsing files...", flush=True)
        parser = JavaParser()
        parsed_data = []
        for f in files:
            funcs = parser.parse_file(f)
            parsed_data.append({
                "file_path": f,
                "functions": funcs
            })
            
        # 3. Build Graph
        print("Building graph...", flush=True)
        builder = GraphBuilder()
        builder.build_graph(parsed_data)
        STATE["graph"] = builder.graph
        
        # 5. Clustering
        print("Clustering...", flush=True)
        cluster_engine = ClusteringEngine()
        clusters = cluster_engine.cluster_graph(builder.graph)
        cluster_engine.assign_clusters(builder.graph, clusters)
        STATE["clusters"] = clusters
        
        STATE["graph_data"] = builder.get_graph_data()
        STATE["status"] = "READY"
        
        return {
            "status": "COMPLETED",
            "file_count": len(files),
            "node_count": builder.graph.number_of_nodes(),
            "cluster_count": len(clusters)
        }
        
    except Exception as e:
        STATE["status"] = "ERROR"
        try:
            with open(debug_path, "a") as f:
                f.write(f"Error: {e}\n")
                import traceback
                f.write(traceback.format_exc())
                f.write("\n")
        except:
            pass
        print(f"Analysis failed: {e}", flush=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/graph")
def get_graph():
    if not STATE["graph_data"]:
        return {"nodes": [], "links": []}
    return STATE["graph_data"]

@app.get("/clusters")
def get_clusters():
    if not STATE["clusters"]:
        return []
    return STATE["clusters"]

@app.post("/query")
def chat_query(q: str):
    # Stub for Chat Interface
    return {
        "response": f"I analyzed your question: '{q}'. Since I am an MVP without a live LLM key, I can tell you this system has {len(STATE.get('clusters', []))} clusters. Look at the Red ones!",
        "relevant_nodes": []
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8005)
