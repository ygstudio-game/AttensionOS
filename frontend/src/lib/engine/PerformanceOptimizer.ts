/**
 * PerformanceOptimizer - Manages real-time performance for attention tracking
 * Implements adaptive frame rates, resource throttling, and battery optimization
 */

import { useState, useEffect } from 'react';

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private frameRate: number = 30;
  private isOptimized: boolean = false;
  private batteryLevel: number = 1;
  private cpuUsage: number = 0;
  private memoryUsage: number = 0;
  
  // Performance thresholds
  private readonly OPTIMIZATION_THRESHOLD = {
    BATTERY_LOW: 0.2,      // 20% battery
    CPU_HIGH: 80,          // 80% CPU usage
    MEMORY_HIGH: 80,       // 80% memory usage
    FPS_LOW: 15            // Below 15 FPS
  };

  private constructor() {
    this.initializeMonitoring();
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    // Monitor battery level
    this.monitorBattery();
    
    // Monitor CPU and memory usage
    this.monitorSystemResources();
    
    // Monitor frame rate
    this.monitorFrameRate();
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Listen for window focus/blur
    window.addEventListener('focus', this.handleWindowFocus.bind(this));
    window.addEventListener('blur', this.handleWindowBlur.bind(this));
  }

  /**
   * Monitor battery level
   */
  private async monitorBattery(): Promise<void> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        
        const updateBattery = () => {
          this.batteryLevel = battery.level;
          this.evaluateOptimization();
        };

        battery.addEventListener('levelchange', updateBattery);
        updateBattery();
      }
    } catch (error) {
      console.warn('Battery API not available');
    }
  }

  /**
   * Monitor system resources (CPU and memory)
   */
  private monitorSystemResources(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        this.evaluateOptimization();
      }, 5000);
    }

    // CPU usage estimation through frame rate monitoring
    this.estimateCPUUsage();
  }

  /**
   * Estimate CPU usage based on frame rate
   */
  private estimateCPUUsage(): void {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureCPU = (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        this.cpuUsage = Math.max(0, 100 - (fps * 3.33)); // Rough estimation
        this.evaluateOptimization();
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureCPU);
    };
    
    requestAnimationFrame(measureCPU);
  }

  /**
   * Monitor frame rate
   */
  private monitorFrameRate(): void {
    let frames = 0;
    let lastFrameTime = performance.now();
    
    const measureFPS = (currentTime: number) => {
      frames++;
      
      if (currentTime - lastFrameTime >= 1000) {
        this.frameRate = frames;
        this.evaluateOptimization();
        frames = 0;
        lastFrameTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  /**
   * Evaluate if optimization is needed
   */
  private evaluateOptimization(): void {
    const needsOptimization = 
      this.batteryLevel < this.OPTIMIZATION_THRESHOLD.BATTERY_LOW ||
      this.cpuUsage > this.OPTIMIZATION_THRESHOLD.CPU_HIGH ||
      this.memoryUsage > this.OPTIMIZATION_THRESHOLD.MEMORY_HIGH ||
      this.frameRate < this.OPTIMIZATION_THRESHOLD.FPS_LOW;

    if (needsOptimization && !this.isOptimized) {
      this.activateOptimization();
    } else if (!needsOptimization && this.isOptimized) {
      this.deactivateOptimization();
    }
  }

  /**
   * Activate performance optimization
   */
  private activateOptimization(): void {
    this.isOptimized = true;
    console.log('🔧 Performance optimization activated');
    
    // Reduce frame rate
    this.frameRate = 15;
    
    // Notify listeners
    window.dispatchEvent(new CustomEvent('performance-optimized', {
      detail: {
        optimized: true,
        frameRate: this.frameRate,
        batteryLevel: this.batteryLevel,
        cpuUsage: this.cpuUsage,
        memoryUsage: this.memoryUsage
      }
    }));
  }

  /**
   * Deactivate performance optimization
   */
  private deactivateOptimization(): void {
    this.isOptimized = false;
    console.log('✅ Performance optimization deactivated');
    
    // Restore frame rate
    this.frameRate = 30;
    
    // Notify listeners
    window.dispatchEvent(new CustomEvent('performance-optimized', {
      detail: {
        optimized: false,
        frameRate: this.frameRate,
        batteryLevel: this.batteryLevel,
        cpuUsage: this.cpuUsage,
        memoryUsage: this.memoryUsage
      }
    }));
  }

  /**
   * Handle visibility change
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Reduce processing when tab is hidden
      this.frameRate = 5;
    } else {
      // Restore normal processing
      this.frameRate = this.isOptimized ? 15 : 30;
    }
  }

  /**
   * Handle window focus/blur
   */
  private handleWindowFocus(): void {
    this.frameRate = this.isOptimized ? 15 : 30;
  }

  private handleWindowBlur(): void {
    // Slightly reduce processing when window is not focused
    this.frameRate = Math.max(10, this.frameRate - 5);
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): {
    frameRate: number;
    batteryLevel: number;
    cpuUsage: number;
    memoryUsage: number;
    isOptimized: boolean;
  } {
    return {
      frameRate: this.frameRate,
      batteryLevel: this.batteryLevel,
      cpuUsage: this.cpuUsage,
      memoryUsage: this.memoryUsage,
      isOptimized: this.isOptimized
    };
  }

  /**
   * Get recommended frame rate for current conditions
   */
  public getRecommendedFrameRate(): number {
    if (this.isOptimized) {
      return 15;
    }
    
    // Adaptive frame rate based on battery
    if (this.batteryLevel < 0.5) {
      return 20;
    }
    
    return 30;
  }

  /**
   * Force optimization state
   */
  public setOptimization(enabled: boolean): void {
    if (enabled && !this.isOptimized) {
      this.activateOptimization();
    } else if (!enabled && this.isOptimized) {
      this.deactivateOptimization();
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.removeEventListener('focus', this.handleWindowFocus.bind(this));
    window.removeEventListener('blur', this.handleWindowBlur.bind(this));
    PerformanceOptimizer.instance = null as any;
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Performance monitoring hook for React components
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState(performanceOptimizer.getMetrics());

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceOptimizer.getMetrics());
    };

    const interval = setInterval(updateMetrics, 1000);
    
    // Listen for optimization events
    const handleOptimizationChange = (event: CustomEvent) => {
      setMetrics(event.detail);
    };

    window.addEventListener('performance-optimized', handleOptimizationChange as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('performance-optimized', handleOptimizationChange as EventListener);
    };
  }, []);

  return metrics;
}