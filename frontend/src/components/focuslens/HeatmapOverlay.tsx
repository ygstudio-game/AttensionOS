import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useFocusStore } from '@/store/useFocusStore';

// Type definitions for D3.js
interface GazePoint {
  x: number;
  y: number;
  weight: number;
  timestamp: number;
}

interface Cluster {
  centerX: number;
  centerY: number;
  size: number;
  points: Array<{ x: number; y: number }>;
}

interface ContourData {
  value: number;
  type: string;
  coordinates: any[];
}

interface HeatmapOverlayProps {
  width: number;
  height: number;
  isActive: boolean;
}

export function HeatmapOverlay({ width, height, isActive }: HeatmapOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const gazeHeatmap = useFocusStore(state => state.gazeHeatmap);
  const isFocused = useFocusStore(state => state.isFocused);
  const faceDetected = useFocusStore(state => state.faceDetected);

  useEffect(() => {
    if (!svgRef.current || !isActive) return;

    const svg = d3.select(svgRef.current);
    const container = svg.node()?.parentElement;
    
    if (!container) return;

    // Clear previous content
    svg.selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create gradient definition for heatmap colors
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'heatmap-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0F172A') // Dark blue (low attention)
      .attr('stop-opacity', 0.8);

    gradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#38BDF8') // Sky blue (medium attention)
      .attr('stop-opacity', 0.6);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#FB923C') // Orange (high attention)
      .attr('stop-opacity', 0.4);

    // Create heatmap group
    const heatmapGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    setIsInitialized(true);
  }, [width, height, isActive]); // Fixed dependency array

  useEffect(() => {
    if (!isInitialized || !isActive || !faceDetected) return;

    const svg = d3.select(svgRef.current);
    const heatmapGroup = svg.select('g');

    // Clear previous heatmap
    heatmapGroup.selectAll('circle').remove();

    if (gazeHeatmap.length === 0) return;

    // Create heatmap visualization
    const maxWeight = Math.max(...gazeHeatmap.map(d => d.weight));
    const minWeight = Math.min(...gazeHeatmap.map(d => d.weight));

    // Scale for radius based on weight
    const radiusScale = d3.scaleLinear()
      .domain([minWeight, maxWeight])
      .range([2, 15]);

    // Add heatmap circles with reduced opacity for better text readability
    heatmapGroup.selectAll('circle')
      .data(gazeHeatmap)
      .enter()
      .append('circle')
      .attr('cx', (d: GazePoint) => d.x * width)
      .attr('cy', (d: GazePoint) => d.y * height)
      .attr('r', (d: GazePoint) => radiusScale(d.weight))
      .attr('fill', 'url(#heatmap-gradient)')
      .attr('opacity', 0.2) // Reduced from 0.6 to 0.2 for better text readability
      .attr('stroke', '#38BDF8')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.1) // Reduced from 0.3 to 0.1
      .transition()
      .duration(500)
      .attr('opacity', isFocused ? 0.3 : 0.2); // Reduced maximum opacity

    // Add heatmap boundary indicator
    const boundary = heatmapGroup.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('stroke', isFocused ? '#38BDF8' : '#FB923C')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.5);

  }, [gazeHeatmap, isInitialized, isActive, isFocused, faceDetected, width, height]);

  // Post-session heatmap analysis
  const generateHeatmapAnalysis = () => {
    if (gazeHeatmap.length < 10) return null;

    const clusters = analyzeGazeClusters(gazeHeatmap);
    return {
      focusAreas: clusters.filter(c => c.size > 5),
      distractionZones: clusters.filter(c => c.size <= 5),
      avgFixationDuration: gazeHeatmap.reduce((sum, d) => sum + (d.weight * 100), 0) / gazeHeatmap.length
    };
  };

  const analyzeGazeClusters = (data: GazePoint[]): Cluster[] => {
    // Simple clustering algorithm for heatmap analysis
    const clusters: Cluster[] = [];

    data.forEach(point => {
      let assigned = false;
      
      // Try to assign to existing cluster
      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(point.x - cluster.centerX, 2) + 
          Math.pow(point.y - cluster.centerY, 2)
        );
        
        if (distance < 0.1) { // 10% threshold for clustering
          cluster.size++;
          cluster.points.push({ x: point.x, y: point.y });
          cluster.centerX = cluster.points.reduce((sum, p) => sum + p.x, 0) / cluster.points.length;
          cluster.centerY = cluster.points.reduce((sum, p) => sum + p.y, 0) / cluster.points.length;
          assigned = true;
          break;
        }
      }

      // Create new cluster if not assigned
      if (!assigned) {
        clusters.push({
          centerX: point.x,
          centerY: point.y,
          size: 1,
          points: [{ x: point.x, y: point.y }]
        });
      }
    });

    return clusters;
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
      
      {/* Heatmap Analysis Overlay */}
      {gazeHeatmap.length > 0 && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-slate-700">
          <h4 className="text-xs font-semibold text-slate-300 mb-2">Heatmap Analysis</h4>
          <div className="text-xs text-slate-400 space-y-1">
            <div>Total Gaze Points: <span className="text-sky-400 font-mono">{gazeHeatmap.length}</span></div>
            <div>Avg Focus Score: <span className="text-orange-400 font-mono">{Math.round(useFocusStore.getState().focusScore)}</span>%</div>
            <div>Status: <span className={`font-mono ${isFocused ? 'text-green-400' : 'text-red-400'}`}>
              {isFocused ? 'FOCUSED' : 'DISTRACTED'}
            </span></div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-slate-700">
        <h4 className="text-xs font-semibold text-slate-300 mb-2">Attention Intensity</h4>
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gradient-to-r from-slate-900 via-sky-500 to-orange-500 rounded-full"></div>
          <div className="text-xs text-slate-400">
            <span className="text-slate-400">Low</span> → <span className="text-orange-400">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Post-session heatmap component for analytics dashboard
export function PostSessionHeatmap({ 
  data, 
  width = 800, 
  height = 600 
}: { 
  data: GazePoint[];
  width?: number;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create heatmap using density estimation
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

    // Create density contour
    const density = d3.contourDensity()
      .x((d: [number, number]) => xScale(d[0]))
      .y((d: [number, number]) => yScale(d[1]))
      .size([innerWidth, innerHeight])
      .bandwidth(20)
      .thresholds(20);

    const contours = density(data.map(d => [d.x, d.y]) as [number, number][]);

    // Color scale for contours
    const color = d3.scaleSequential()
      .domain([0, d3.max(contours, (d: any) => d.value) || 1])
      .interpolator(d3.interpolateViridis);

    g.selectAll('path')
      .data(contours)
      .enter().append('path')
      .attr('d', d3.geoPath())
      .attr('fill', (d: any) => color(d.value))
      .attr('opacity', 0.6);

    // Add scatter plot of actual gaze points
    g.selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr('cx', (d: GazePoint) => xScale(d.x))
      .attr('cy', (d: GazePoint) => yScale(d.y))
      .attr('r', 2)
      .attr('fill', '#ffffff')
      .attr('opacity', 0.3);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll('text')
      .attr('fill', '#94a3b8');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .attr('fill', '#94a3b8');

  }, [data, width, height]);

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
      <h3 className="text-lg font-semibold text-white mb-4">Session Heatmap Analysis</h3>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-auto"
      />
      {data.length === 0 && (
        <div className="text-center text-slate-500 py-8">
          No gaze data available for this session
        </div>
      )}
    </div>
  );
}