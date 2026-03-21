import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useFocusStore } from '@/store/useFocusStore';

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

    svg.selectAll('*').remove();

    const margin = { top: 0, right: 0, bottom: 0, left: 0 };

    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'heatmap-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0A0C10')
      .attr('stop-opacity', 0.8);

    gradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#00B4D8')
      .attr('stop-opacity', 0.6);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#00E5FF')
      .attr('stop-opacity', 0.4);

    svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    setIsInitialized(true);
  }, [width, height, isActive]);

  useEffect(() => {
    if (!isInitialized || !isActive || !faceDetected) return;

    const svg = d3.select(svgRef.current);
    const heatmapGroup = svg.select('g');
    heatmapGroup.selectAll('circle').remove();

    if (gazeHeatmap.length === 0) return;

    const maxWeight = Math.max(...gazeHeatmap.map(d => d.weight));
    const minWeight = Math.min(...gazeHeatmap.map(d => d.weight));

    const radiusScale = d3.scaleLinear()
      .domain([minWeight, maxWeight])
      .range([2, 15]);

    heatmapGroup.selectAll('circle')
      .data(gazeHeatmap)
      .enter()
      .append('circle')
      .attr('cx', (d: GazePoint) => d.x * width)
      .attr('cy', (d: GazePoint) => d.y * height)
      .attr('r', (d: GazePoint) => radiusScale(d.weight))
      .attr('fill', '#00E5FF')
      .attr('opacity', 0.15)
      .attr('stroke', '#00E5FF')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.08)
      .transition()
      .duration(500)
      .attr('opacity', isFocused ? 0.25 : 0.15);

    const boundary = heatmapGroup.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('stroke', isFocused ? '#00E5FF' : '#FF3B5C')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.3);

  }, [gazeHeatmap, isInitialized, isActive, isFocused, faceDetected, width, height]);

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
    const clusters: Cluster[] = [];
    data.forEach(point => {
      let assigned = false;
      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(point.x - cluster.centerX, 2) +
          Math.pow(point.y - cluster.centerY, 2)
        );
        if (distance < 0.1) {
          cluster.size++;
          cluster.points.push({ x: point.x, y: point.y });
          cluster.centerX = cluster.points.reduce((sum, p) => sum + p.x, 0) / cluster.points.length;
          cluster.centerY = cluster.points.reduce((sum, p) => sum + p.y, 0) / cluster.points.length;
          assigned = true;
          break;
        }
      }
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
      <svg ref={svgRef} width={width} height={height} className="w-full h-full" />

      {gazeHeatmap.length > 0 && (
        <div className="absolute top-4 left-4 glass-panel p-3 rounded-xl">
          <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Heatmap</h4>
          <div className="text-xs text-white/30 space-y-1">
            <div>Points: <span className="text-[#00E5FF] font-mono">{gazeHeatmap.length}</span></div>
            <div>Focus: <span className="text-[#00E5FF] font-mono">{Math.round(useFocusStore.getState().focusScore)}</span>%</div>
            <div>Status: <span className={`font-mono ${isFocused ? 'text-[#00E5FF]' : 'text-[#FF3B5C]'}`}>
              {isFocused ? 'FOCUSED' : 'DISTRACTED'}
            </span></div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 glass-panel p-3 rounded-xl">
        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Intensity</h4>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full" style={{ background: 'linear-gradient(90deg, #0A0C10, #00B4D8, #00E5FF)' }} />
          <div className="text-[10px] text-white/25">
            <span>Low</span> → <span className="text-[#00E5FF]">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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

    const xScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

    const density = d3.contourDensity()
      .x((d: [number, number]) => xScale(d[0]))
      .y((d: [number, number]) => yScale(d[1]))
      .size([innerWidth, innerHeight])
      .bandwidth(20)
      .thresholds(20);

    const contours = density(data.map(d => [d.x, d.y]) as [number, number][]);

    const color = d3.scaleSequential()
      .domain([0, d3.max(contours, (d: any) => d.value) || 1])
      .interpolator(d3.interpolateViridis);

    g.selectAll('path')
      .data(contours)
      .enter().append('path')
      .attr('d', d3.geoPath())
      .attr('fill', (d: any) => color(d.value))
      .attr('opacity', 0.6);

    g.selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr('cx', (d: GazePoint) => xScale(d.x))
      .attr('cy', (d: GazePoint) => yScale(d.y))
      .attr('r', 2)
      .attr('fill', '#00E5FF')
      .attr('opacity', 0.3);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll('text')
      .attr('fill', '#64748B');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .attr('fill', '#64748B');

  }, [data, width, height]);

  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="text-lg font-semibold text-white mb-4">Session Heatmap Analysis</h3>
      <svg ref={svgRef} width={width} height={height} className="w-full h-auto" />
      {data.length === 0 && (
        <div className="text-center text-white/20 py-8 text-sm">
          No gaze data available for this session
        </div>
      )}
    </div>
  );
}