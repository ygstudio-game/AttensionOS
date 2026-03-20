import { useEffect, useState } from 'react';
import { useFocusStore } from '@/store/useFocusStore';
import { PostSessionHeatmap } from './HeatmapOverlay';
import { Progress } from '@/components/ui/progress';

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

function FocusHistoryGraph({ data, width = 200, height = 50, color = "#38bdf8" }: { data: number[], width?: number, height?: number, color?: string }) {
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
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        points={points}
        className="transition-all duration-300"
      />
      {/* Area fill */}
      <polyline
        fill={`${color}20`}
        stroke="none"
        points={`${width},${height} 0,${height} ${points}`}
      />
    </svg>
  );
}

export function AnalyticsDashboard({ isActive, sessionId }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(false);

  // State from store
  const { dwm, focusScore, gazeHeatmap, alertHistory, isFocused, faceDetected } = useFocusStore();

  useEffect(() => {
    if (!isActive) return;
    fetchAnalytics();
  }, [isActive, timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to backend
      const mockData = {
        totalSessions: 15,
        totalDWM: 120.5,
        avgFocusScore: 72.3,
        totalFrames: 45000,
        sessions: [
          { date: '2024-01-15', dwm: 8.5, focusScore: 75, distractions: 3 },
          { date: '2024-01-14', dwm: 6.2, focusScore: 68, distractions: 5 },
          { date: '2024-01-13', dwm: 9.1, focusScore: 82, distractions: 2 },
          { date: '2024-01-12', dwm: 4.8, focusScore: 55, distractions: 8 },
          { date: '2024-01-11', dwm: 7.3, focusScore: 71, distractions: 4 },
        ]
      };
      
      setMetrics(mockData);
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
    const dailyGoal = 60; // 1 hour per day goal
    return Math.min((dwm / dailyGoal) * 100, 100);
  };

  const getAlertSummary = () => {
    const summary = {
      low_focus: 0,
      fatigue: 0,
      distracted: 0,
      break_reminder: 0
    };
    
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Session Analytics</h2>
          <p className="text-slate-400">Deep Work Insights & Performance Tracking</p>
        </div>
        <div className="flex gap-2">
          {(['1d', '7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range 
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {range === '1d' ? 'Today' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Current Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm">Current Focus Score</p>
              <p className="text-2xl font-bold text-white">{focusScore}%</p>
              <p className={`text-sm mt-1 ${focusScore > 70 ? 'text-green-400' : focusScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {focusScore > 70 ? 'Excellent' : focusScore > 50 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${isFocused ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <div className={`w-3 h-3 rounded-full ${isFocused ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm">Deep Work Minutes</p>
              <p className="text-2xl font-bold text-white">{dwm.toFixed(1)}</p>
              <p className="text-slate-400 text-sm">Today</p>
            </div>
            <div className="text-right">
              <Progress value={getDWMProgress()} className="w-24 h-2 mb-2" />
              <p className="text-xs text-slate-400">Daily Goal</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm">Gaze Points</p>
              <p className="text-2xl font-bold text-white">{gazeHeatmap.length}</p>
              <p className="text-slate-400 text-sm">This Session</p>
            </div>
            <div className="text-sky-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm">Alerts Triggered</p>
              <p className="text-2xl font-bold text-white">{alertHistory.length}</p>
              <p className="text-slate-400 text-sm">Today</p>
            </div>
            <div className="text-orange-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Focus History Visualization */}
        <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Focus History (Last 60s)</h3>
          <div className="flex items-center justify-center p-4">
            <FocusHistoryGraph 
              data={useFocusStore.getState().focusHistory}
              width={500}
              height={300}
              color="#38bdf8"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>60s ago</span>
            <span>Now</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Focus Trend</span>
              <span className={`font-mono ${focusTrend > 0 ? 'text-green-400' : focusTrend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {focusTrend > 0 ? '+' : ''}{focusTrend.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Session Count</span>
              <span className="font-mono text-sky-400">{metrics?.totalSessions || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total DWM</span>
              <span className="font-mono text-orange-400">{formatTime(metrics?.totalDWM || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Avg Focus</span>
              <span className="font-mono text-purple-400">{metrics?.avgFocusScore || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert History */}
      <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Alert Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="text-red-400 font-bold text-xl">{alertSummary.low_focus}</div>
            <div className="text-slate-400 text-sm">Low Focus</div>
          </div>
          <div className="text-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="text-orange-400 font-bold text-xl">{alertSummary.fatigue}</div>
            <div className="text-slate-400 text-sm">Fatigue</div>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="text-yellow-400 font-bold text-xl">{alertSummary.distracted}</div>
            <div className="text-slate-400 text-sm">Distracted</div>
          </div>
          <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="text-blue-400 font-bold text-xl">{alertSummary.break_reminder}</div>
            <div className="text-slate-400 text-sm">Break Reminder</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {focusScore < 60 && (
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Improvement Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-slate-300">
              <strong className="text-orange-400">Environment:</strong> Reduce distractions, ensure proper lighting
            </div>
            <div className="text-slate-300">
              <strong className="text-orange-400">Posture:</strong> Maintain upright position, keep screen at eye level
            </div>
            <div className="text-slate-300">
              <strong className="text-orange-400">Breaks:</strong> Follow 20-20-20 rule to reduce eye strain
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          <span className="ml-2 text-slate-400">Loading analytics...</span>
        </div>
      )}
    </div>
  );
}

// Compact analytics widget for sidebar
export function CompactAnalyticsWidget() {
  const { dwm, focusScore, gazeHeatmap, alertHistory, isFocused } = useFocusStore();

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700 space-y-3">
      <h4 className="text-sm font-semibold text-white">Live Analytics</h4>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Focus Score</span>
          <span className={`font-mono ${focusScore > 70 ? 'text-green-400' : 'text-orange-400'}`}>
            {focusScore}%
          </span>
        </div>
        <Progress value={focusScore} className="h-1" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Focus History</span>
        </div>
        <div className="py-2 flex justify-center border-t border-slate-800/50 pt-3">
          <FocusHistoryGraph 
            data={useFocusStore.getState().focusHistory}
            width={240}
            height={60}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/50">
        <span className="text-slate-400">Status</span>
        <div className={`flex items-center gap-2 px-2 py-1 rounded ${isFocused ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <div className={`w-2 h-2 rounded-full ${isFocused ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
          <span className={isFocused ? 'text-green-400' : 'text-red-400'}>
            {isFocused ? 'FOCUSED' : 'DISTRACTED'}
          </span>
        </div>
      </div>
    </div>
  );
}