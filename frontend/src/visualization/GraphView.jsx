import React, { useRef, useState, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';

// Colorful iOS-inspired palette
const CLUSTER_COLORS = [
  '#0A84FF', // Blue
  '#30D158', // Green
  '#FF9F0A', // Orange
  '#BF5AF2', // Purple
  '#64D2FF', // Cyan
  '#FF375F', // Pink
  '#FFD60A', // Yellow
  '#5E5CE6', // Indigo
];

const GraphView = ({ data, onNodeClick, selectedNode }) => {
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('link').distance(40).strength(0.8);
      fgRef.current.d3Force('charge').strength(-15);
      fgRef.current.d3Force('center').strength(0.5);
    }
  }, [data]);

  const getNodeColor = (node) => {
    const clusterIndex = parseInt(node.cluster || 0) % CLUSTER_COLORS.length;
    return CLUSTER_COLORS[clusterIndex];
  };

  // Smooth easing function (ease-in-out cubic)
  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Custom smooth camera animation
  const animateCamera = (targetPos, targetLookAt, duration = 1500) => {
    if (!fgRef.current) return;
    
    const camera = fgRef.current.camera();
    const controls = fgRef.current.controls();
    
    const startPos = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    };
    
    const startLookAt = controls.target ? {
      x: controls.target.x,
      y: controls.target.y,
      z: controls.target.z
    } : { x: 0, y: 0, z: 0 };
    
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);
      
      const newPos = {
        x: startPos.x + (targetPos.x - startPos.x) * easedProgress,
        y: startPos.y + (targetPos.y - startPos.y) * easedProgress,
        z: startPos.z + (targetPos.z - startPos.z) * easedProgress
      };
      
      const newLookAt = {
        x: startLookAt.x + (targetLookAt.x - startLookAt.x) * easedProgress,
        y: startLookAt.y + (targetLookAt.y - startLookAt.y) * easedProgress,
        z: startLookAt.z + (targetLookAt.z - startLookAt.z) * easedProgress
      };
      
      camera.position.set(newPos.x, newPos.y, newPos.z);
      if (controls.target) {
        controls.target.set(newLookAt.x, newLookAt.y, newLookAt.z);
      }
      camera.lookAt(newLookAt.x, newLookAt.y, newLookAt.z);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const handleNodeClick = (node) => {
    if (selectedNode && selectedNode.id === node.id) {
      onNodeClick(null);
      // Smooth zoom out to overview
      animateCamera({ x: 0, y: 0, z: 220 }, { x: 0, y: 0, z: 0 }, 1500);
    } else {
      const distance = 50;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      // Smooth zoom in to node
      animateCamera(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        { x: node.x, y: node.y, z: node.z },
        1500
      );
      onNodeClick(node);
    }
  };

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="w-full h-full absolute inset-0 flex items-center justify-center text-white" style={{ background: '#000000' }}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse" />
          <p className="text-lg font-light text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full absolute inset-0" style={{ zIndex: 0, background: '#000000' }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        
        nodeColor={getNodeColor}
        nodeRelSize={4}
        nodeOpacity={1}
        
        nodeThreeObject={node => {
          const group = new THREE.Group();
          const isSelected = selectedNode && selectedNode.id === node.id;
          const color = isSelected ? '#FF453A' : getNodeColor(node);
          
          // Clean sphere
          const sphereGeometry = new THREE.SphereGeometry(isSelected ? 4 : 3, 32, 32);
          const sphereMaterial = new THREE.MeshBasicMaterial({ color: color });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          group.add(sphere);
          
          // Subtle glow
          const glowGeometry = new THREE.SphereGeometry(isSelected ? 5.5 : 4, 32, 32);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.15,
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          group.add(glow);
          
          // Clean SF-style label
          const sprite = new SpriteText(node.name);
          sprite.color = '#ffffff';
          sprite.textHeight = 2;
          sprite.fontWeight = '500';
          sprite.fontFace = '-apple-system, BlinkMacSystemFont, SF Pro Text, sans-serif';
          sprite.backgroundColor = 'rgba(28,28,30,0.9)';
          sprite.padding = 1.2;
          sprite.borderRadius = 1.5;
          sprite.position.y = 6;
          group.add(sprite);
          
          return group;
        }}
        nodeThreeObjectExtend={false}
        
        // Directed edges with arrows
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={0.9}
        linkDirectionalArrowColor={() => 'rgba(255,255,255,0.6)'}
        linkOpacity={0.35}
        linkWidth={1}
        linkColor={() => 'rgba(255,255,255,0.2)'}
        linkCurvature={0.1}
        
        // Subtle particles
        linkDirectionalParticles={1}
        linkDirectionalParticleSpeed={0.003}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={() => 'rgba(255,255,255,0.5)'}
        
        onNodeClick={handleNodeClick}
        
        warmupTicks={120}
        cooldownTicks={80}
        
        backgroundColor="#000000"
        showNavInfo={false}
      />
    </div>
  );
};

export default GraphView;
