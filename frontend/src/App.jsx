import React, { useState, useEffect } from 'react';
import GraphView from './visualization/GraphView';
import ChatPanel from './chat/ChatPanel';
import { Code, Info, Zap, GitBranch, Layers } from 'lucide-react';

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:8005/graph');
            const data = await res.json();
            console.log("Graph data received:", data);
            setGraphData(data);
            
            const clusterRes = await fetch('http://localhost:8005/clusters');
            const clusterData = await clusterRes.json();
            setClusters(clusterData);
        } catch (e) {
            console.error("Backend not ready", e);
        }
    };
    
    fetchData();
  }, []);

  const handleQuery = async (text) => {
    const res = await fetch(`http://localhost:8005/query?q=${encodeURIComponent(text)}`, { method: 'POST' });
    const data = await res.json();
    return data.response;
  };

  const clusterColors = ['#0A84FF', '#30D158', '#FF9F0A', '#BF5AF2', '#64D2FF', '#FF375F', '#FFD60A', '#5E5CE6'];

  return (
    <div className="relative w-screen h-screen overflow-hidden text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', background: 'linear-gradient(135deg, #0c0c1d 0%, #1a1a2e 50%, #16213e 100%)' }}>
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-4 sm:pt-5">
        <div className="text-center">
          <h1 className="text-lg sm:text-xl tracking-widest">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">CODE</span>
            <span className="text-white/90 font-light ml-2">ARCHAEOLOGIST</span>
          </h1>
          <p className="text-[9px] sm:text-[10px] text-white/30 tracking-wider mt-1">MVP BUILD v0.1</p>
        </div>
      </div>

      {/* Stats Bar - Responsive */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 hidden sm:flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs text-white/70">{graphData.nodes.length} nodes</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <GitBranch className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs text-white/70">{graphData.links?.length || 0} links</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs text-white/70">{clusters.length} clusters</span>
        </div>
      </div>

      {/* 3D Graph Layer */}
      <GraphView data={graphData} onNodeClick={setSelectedNode} selectedNode={selectedNode} />

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none z-10">
        
        {/* Left: Chat Panel */}
        <ChatPanel onQuery={handleQuery} />

        {/* Right: Artifact Panel - Responsive */}
        <div className="absolute top-4 right-4 bottom-16 w-64 sm:w-72 lg:w-80 pointer-events-none">
            <div 
              className="w-full h-full rounded-3xl pointer-events-auto flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}
            >
                {selectedNode ? (
                    <div className="p-4 sm:p-5 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
                              <Code className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{selectedNode.name}</h3>
                              <p className="text-[10px] text-white/40">Function</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 flex-1 overflow-auto">
                            <div className="group">
                                <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">File</label>
                                <p className="text-[12px] sm:text-[13px] text-white/80 font-mono mt-1.5 px-3 py-2 rounded-xl transition-colors group-hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    {selectedNode.file?.split(/[/\\]/).pop()}
                                </p>
                            </div>
                            
                            <div>
                                <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Cluster</label>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <div 
                                      className="w-4 h-4 rounded-full shadow-lg ring-2 ring-white/20" 
                                      style={{ background: clusterColors[parseInt(selectedNode.cluster || 0) % 8] }}
                                    />
                                    <span className="text-[12px] sm:text-[13px] text-white/80">Cluster {selectedNode.cluster || "N/A"}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Source Code</label>
                                <pre 
                                  className="text-[10px] sm:text-[11px] text-white/85 font-mono mt-1.5 p-3 sm:p-4 rounded-2xl overflow-auto max-h-40 sm:max-h-56 scrollbar-thin"
                                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}
                                >
                                    <code>{selectedNode.code || "// Source not available"}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                        <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4 sm:mb-5 shadow-lg animate-pulse" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Info className="w-5 sm:w-6 h-5 sm:h-6 text-white/40" />
                        </div>
                        <h3 className="text-sm sm:text-base font-medium text-white/90 mb-2">Select an Artifact</h3>
                        <p className="text-[11px] sm:text-[12px] text-white/40 leading-relaxed max-w-[160px] sm:max-w-[180px]">
                            Click any node to reveal its secrets.
                        </p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-3 sm:pb-4">
        <p className="text-[9px] sm:text-[10px] text-white/20 tracking-wide">
          Drag: rotate · Scroll: zoom · Shift+drag: pan
        </p>
      </div>
    </div>
  );
}

export default App;



