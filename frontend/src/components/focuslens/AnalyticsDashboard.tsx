"use client"
import { useEffect, useState } from 'react';
import { useFocusStore } from '@/store/useFocusStore';
import { PostSessionHeatmap } from './HeatmapOverlay';
import { Eye, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

interface AnalyticsDashboardProps {
  isActive: boolean;
  sessionId?: string;
}

interface SessionMetrics {
  totalSessions: number;
  totalDWM: number;
  avgFocusScore: number;
  totalFrames: number;
  sessions: any[];
}

function FocusHistoryGraph({ data, width = 200, height = 50, color = "#00E5FF" }: { data: number[], width?: number, height?: number, color?: string }) {
  if (!data || data.length === 0) return null;

  const max = 100;
  const min = 0;
  const range = max - min;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="chartGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Area fill */}
      <polyline
        fill="url(#chartFill)"
        stroke="none"
        points={`${width},${height} 0,${height} ${points}`}
      />
      {/* Neon line */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        points={points}
        filter="url(#chartGlow)"
        className="transition-all duration-300"
      />
    </svg>
  );
}

export function AnalyticsDashboard({ isActive, sessionId }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(false);

  const { dwm, focusScore, gazeHeatmap, alertHistory, isFocused, faceDetected, focusHistory, sessionStartTime } = useFocusStore();

  useEffect(() => {
    if (!isActive) return;
    fetchAnalytics();
  }, [isActive, timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Build real metrics from the current session store data
      const sessionDurationMin = sessionStartTime ? (Date.now() - sessionStartTime) / 60000 : 0;
      const avgScore = focusHistory.length > 0 ? Math.round(focusHistory.reduce((a, b) => a + b, 0) / focusHistory.length) : 0;
      const distractionCount = alertHistory.filter(a => a.type === 'distracted' || a.type === 'low_focus').length;

      const realData = {
        totalSessions: 1,
        totalDWM: dwm,
        avgFocusScore: avgScore,
        totalFrames: gazeHeatmap.length,
        sessions: [
          { date: new Date().toISOString().split('T')[0], dwm: dwm, focusScore: avgScore, distractions: distractionCount },
        ]
      };
      setMetrics(realData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFocusTrend = () => {
    if (!metrics) return 0;
    const recentSessions = metrics.sessions.slice(-3);
    if (recentSessions.length < 2) return 0;
    const current = recentSessions[recentSessions.length - 1].focusScore;
    const previous = recentSessions[recentSessions.length - 2].focusScore;
    return current - previous;
  };

  const getDWMProgress = () => {
    const dailyGoal = 60;
    return Math.min((dwm / dailyGoal) * 100, 100);
  };

  const getAlertSummary = () => {
    const summary = { low_focus: 0, fatigue: 0, distracted: 0, break_reminder: 0 };
    alertHistory.forEach(alert => {
      if (summary.hasOwnProperty(alert.type)) {
        summary[alert.type as keyof typeof summary]++;
      }
    });
    return summary;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes);
    const mins = Math.round((minutes - hours) * 60);
    return `${hours}h ${mins}m`;
  };

  if (!isActive) return null;

  const focusTrend = getFocusTrend();
  const alertSummary = getAlertSummary();

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Session Analytics</h2>
          <p className="text-white/30 text-sm">Deep Work Insights & Performance Tracking</p>
        </div>
        <div className="flex gap-1.5">
          {(['1d', '7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                timeRange === range
                  ? 'glass-panel border-[#00E5FF]/30 text-[#00E5FF]'
                  : 'text-white/30 hover:text-white/50 hover:bg-white/5'
              }`}
            >
              {range === '1d' ? 'Today' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Focus Score */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/30 text-xs font-medium">Current Focus</p>
              <p className="text-3xl font-bold text-white mt-1">{focusScore}<span className="text-sm text-white/25 ml-1">%</span></p>
              <p className={`text-xs mt-1 font-medium ${focusScore > 70 ? 'text-[#22D3A7]' : focusScore > 50 ? 'text-[#FBBF24]' : 'text-[#FF3B5C]'}`}>
                {focusScore > 70 ? 'Excellent' : focusScore > 50 ? 'Good' : 'Low'}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isFocused ? 'bg-[#00E5FF]/10' : 'bg-[#FF3B5C]/10'}`}>
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isFocused ? 'bg-[#00E5FF]' : 'bg-[#FF3B5C]'}`}
                style={{ boxShadow: isFocused ? '0 0 8px rgba(0,229,255,0.5)' : '0 0 8px rgba(255,59,92,0.5)' }}
              />
            </div>
          </div>
        </div>

        {/* DWM */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/30 text-xs font-medium">Deep Work Minutes</p>
              <p className="text-3xl font-bold text-white mt-1">{dwm.toFixed(1)}</p>
              <p className="text-white/20 text-xs">Today</p>
            </div>
            <div>
              <div className="neon-progress-track w-20 h-1.5 mb-1">
                <div className="neon-progress-fill-cyan" style={{ width: `${getDWMProgress()}%`, height: '100%' }} />
              </div>
              <p className="text-[10px] text-white/20 text-right">Daily Goal</p>
            </div>
          </div>
        </div>

        {/* Gaze Points */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/30 text-xs font-medium">Gaze Points</p>
              <p className="text-3xl font-bold text-white mt-1">{gazeHeatmap.length}</p>
              <p className="text-white/20 text-xs">This Session</p>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#00E5FF]/10">
              <Eye className="w-4 h-4 text-[#00E5FF]" />
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/30 text-xs font-medium">Alerts Triggered</p>
              <p className="text-3xl font-bold text-white mt-1">{alertHistory.length}</p>
              <p className="text-white/20 text-xs">Today</p>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#FF3B5C]/10">
              <AlertTriangle className="w-4 h-4 text-[#FF3B5C]" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Focus History */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-white mb-4">Focus History <span className="text-white/20 font-normal">(Last 60s)</span></h3>
          <div className="flex items-center justify-center py-4">
            <FocusHistoryGraph
              data={useFocusStore.getState().focusHistory}
              width={500}
              height={200}
              color="#00E5FF"
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/15 mt-2 font-mono">
            <span>60s ago</span>
            <span>Now</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-sm">Focus Trend</span>
              <span className={`font-mono text-sm ${focusTrend > 0 ? 'text-[#22D3A7]' : focusTrend < 0 ? 'text-[#FF3B5C]' : 'text-white/30'}`}>
                {focusTrend > 0 ? '+' : ''}{focusTrend.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-sm">Session Count</span>
              <span className="font-mono text-sm text-[#00E5FF]">{metrics?.totalSessions || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-sm">Total DWM</span>
              <span className="font-mono text-sm text-[#FBBF24]">{formatTime(metrics?.totalDWM || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-sm">Avg Focus</span>
              <span className="font-mono text-sm text-[#A855F7]">{metrics?.avgFocusScore || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="glass-panel p-5 rounded-2xl">
        <h3 className="text-sm font-semibold text-white mb-4">Alert Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { label: 'Low Focus', count: alertSummary.low_focus, color: '#FF3B5C' },
            { label: 'Fatigue', count: alertSummary.fatigue, color: '#FBBF24' },
            { label: 'Distracted', count: alertSummary.distracted, color: '#A855F7' },
            { label: 'Break Reminder', count: alertSummary.break_reminder, color: '#00E5FF' },
          ].map((item, i) => (
            <div
              key={i}
              className="text-center p-4 rounded-xl"
              style={{
                background: `${item.color}08`,
                border: `1px solid ${item.color}20`,
              }}
            >
              <div className="font-bold text-xl font-mono" style={{ color: item.color }}>{item.count}</div>
              <div className="text-white/25 text-xs mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {focusScore < 60 && (
        <div
          className="glass-panel p-6 rounded-2xl relative overflow-hidden"
          style={{ borderColor: 'rgba(255,59,92,0.2)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #FF3B5C, transparent)' }} />
          <h3 className="text-sm font-semibold text-white mb-3">Improvement Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-white/40">
              <strong className="text-[#FF3B5C]">Environment:</strong> Reduce distractions, ensure proper lighting
            </div>
            <div className="text-white/40">
              <strong className="text-[#FF3B5C]">Posture:</strong> Maintain upright position, screen at eye level
            </div>
            <div className="text-white/40">
              <strong className="text-[#FF3B5C]">Breaks:</strong> Follow 20-20-20 rule to reduce eye strain
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-8 gap-3">
          <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid rgba(0,229,255,0.1)', borderTopColor: '#00E5FF' }} />
          <span className="text-white/25 text-sm">Loading analytics...</span>
        </div>
      )}
    </div>
  );
}

// Compact analytics widget for sidebar
export function CompactAnalyticsWidget() {
  const { dwm, focusScore, gazeHeatmap, alertHistory, isFocused } = useFocusStore();

  return (
    <div className="glass-panel p-4 rounded-2xl space-y-3">
      <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">Live Analytics</h4>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-white/25">Focus Score</span>
          <span className={`font-mono ${focusScore > 70 ? 'text-[#22D3A7]' : 'text-[#FF3B5C]'}`}>
            {focusScore}%
          </span>
        </div>
        <div className="neon-progress-track h-1">
          <div
            className={focusScore > 70 ? "neon-progress-fill-cyan" : "neon-progress-fill-red"}
            style={{ width: `${focusScore}%`, height: '100%' }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-white/25">Focus History</span>
        </div>
        <div className="py-1 flex justify-center border-t border-white/5 pt-3">
          <FocusHistoryGraph
            data={useFocusStore.getState().focusHistory}
            width={220}
            height={50}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
        <span className="text-white/25">Status</span>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${isFocused ? 'bg-[#00E5FF]/10' : 'bg-[#FF3B5C]/10'}`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isFocused ? 'bg-[#00E5FF]' : 'bg-[#FF3B5C]'}`}
            style={{ boxShadow: isFocused ? '0 0 6px rgba(0,229,255,0.5)' : '0 0 6px rgba(255,59,92,0.5)' }}
          />
          <span className={`text-[10px] font-bold ${isFocused ? 'text-[#00E5FF]' : 'text-[#FF3B5C]'}`}>
            {isFocused ? 'FOCUSED' : 'DISTRACTED'}
          </span>
        </div>
      </div>
    </div>
  );
}