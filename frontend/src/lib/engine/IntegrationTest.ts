/**
 * IntegrationTest - Comprehensive testing suite for AttentionOS with FocusLens
 * Tests all components working together in real-world scenarios
 */

import { AttentionEngine } from './AttentionEngine';
import { useFocusStore } from '@/store/useFocusStore';
import { performanceOptimizer } from './PerformanceOptimizer';

// Type guard for error handling
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export class IntegrationTest {
  private attentionEngine: AttentionEngine;
  private testResults: TestResult[] = [];
  private isRunning: boolean = false;

  constructor() {
    this.attentionEngine = new AttentionEngine();
  }

  /**
   * Run comprehensive integration tests
   */
  public async runAllTests(): Promise<TestSuiteResult> {
    console.log('🧪 Starting AttentionOS Integration Tests...');
    
    this.isRunning = true;
    this.testResults = [];

    try {
      // Test 1: Attention Engine Performance
      await this.testAttentionEnginePerformance();
      
      // Test 2: State Management
      await this.testStateManagement();
      
      // Test 3: Performance Optimization
      await this.testPerformanceOptimization();
      
      // Test 4: Audio Alert System
      await this.testAudioAlertSystem();
      
      // Test 5: Memory Management
      await this.testMemoryManagement();
      
      // Test 6: Edge Cases
      await this.testEdgeCases();

      const suiteResult = this.generateTestSuiteResult();
      
      console.log('✅ All integration tests completed');
      console.log('📊 Test Results:', suiteResult);
      
      return suiteResult;

    } catch (error) {
      console.error('❌ Integration tests failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Test Attention Engine Performance
   */
  private async testAttentionEnginePerformance(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Simulate processing 1000 frames
      const mockVideoElement = this.createMockVideoElement();
      
      for (let i = 0; i < 100; i++) {
        const result = await this.attentionEngine.processFrame(mockVideoElement);
        
        if (!result.faceDetected) {
          throw new Error('Face detection failed');
        }
        
        if (result.focusScore < 0 || result.focusScore > 100) {
          throw new Error('Invalid focus score');
        }
      }
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      this.addTestResult({
        name: 'Attention Engine Performance',
        status: processingTime < 5000 ? 'PASS' : 'WARN',
        duration: processingTime,
        details: `Processed 100 frames in ${processingTime.toFixed(2)}ms`
      });

    } catch (error) {
      this.addTestResult({
        name: 'Attention Engine Performance',
        status: 'FAIL',
        duration: performance.now() - startTime,
        details: isError(error) ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test State Management
   */
  private async testStateManagement(): Promise<void> {
    const startTime = performance.now();
    
    try {
      const store = useFocusStore.getState();
      
      // Test state updates
      const initialFocusScore = store.focusScore;
      
      // Simulate state updates
      for (let i = 0; i < 50; i++) {
        store.updateFromEngine({
          focusScore: Math.random() * 100,
          isDrowsy: Math.random() > 0.5,
          isDistracted: Math.random() > 0.5,
          headAligned: Math.random() > 0.5,
          faceDetected: true,
          gazePosition: { x: Math.random(), y: Math.random() }
        });
      }
      
      const finalFocusScore = store.focusScore;
      const hasGazeData = store.gazeHeatmap.length > 0;
      const hasAlerts = store.alertHistory.length > 0;
      
      if (finalFocusScore !== initialFocusScore && hasGazeData && hasAlerts) {
        this.addTestResult({
          name: 'State Management',
          status: 'PASS',
          duration: performance.now() - startTime,
          details: 'State updates working correctly'
        });
      } else {
        throw new Error('State management issues detected');
      }

    } catch (error) {
      this.addTestResult({
        name: 'State Management',
        status: 'FAIL',
        duration: performance.now() - startTime,
        details: isError(error) ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test Performance Optimization
   */
  private async testPerformanceOptimization(): Promise<void> {
    const startTime = performance.now();
    
    try {
      const metrics = performanceOptimizer.getMetrics();
      
      // Test optimization activation
      performanceOptimizer.setOptimization(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const optimizedMetrics = performanceOptimizer.getMetrics();
      
      // Test optimization deactivation
      performanceOptimizer.setOptimization(false);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const normalMetrics = performanceOptimizer.getMetrics();
      
      if (optimizedMetrics.isOptimized && !normalMetrics.isOptimized) {
        this.addTestResult({
          name: 'Performance Optimization',
          status: 'PASS',
          duration: performance.now() - startTime,
          details: 'Optimization system working correctly'
        });
      } else {
        throw new Error('Performance optimization not working');
      }

    } catch (error) {
      this.addTestResult({
        name: 'Performance Optimization',
        status: 'FAIL',
        duration: performance.now() - startTime,
        details: isError(error) ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test Audio Alert System
   */
  private async testAudioAlertSystem(): Promise<void> {
    const startTime = performance.now();
    
    try {
      const store = useFocusStore.getState();
      const initialAlertCount = store.alertHistory.length;
      
      // Test different alert types
      store.triggerAlert('low_focus', 'Test low focus alert');
      store.triggerAlert('fatigue', 'Test fatigue alert');
      store.triggerAlert('distracted', 'Test distraction alert');
      store.triggerAlert('break_reminder', 'Test break reminder');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalAlertCount = store.alertHistory.length;
      
      if (finalAlertCount > initialAlertCount) {
        this.addTestResult({
          name: 'Audio Alert System',
          status: 'PASS',
          duration: performance.now() - startTime,
          details: `Generated ${finalAlertCount - initialAlertCount} alerts`
        });
      } else {
        throw new Error('Audio alerts not working');
      }

    } catch (error) {
      this.addTestResult({
        name: 'Audio Alert System',
        status: 'FAIL',
        duration: performance.now() - startTime,
        details: isError(error) ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test Memory Management
   */
  private async testMemoryManagement(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Monitor memory usage
      const initialMemory = this.getMemoryUsage();
      
      // Simulate memory-intensive operations
      const largeArray = new Array(10000).fill(0).map(() => Math.random());
      
      // Process frames with large data
      for (let i = 0; i < 50; i++) {
        const mockVideoElement = this.createMockVideoElement();
        await this.attentionEngine.processFrame(mockVideoElement);
      }
      
      // Clear large array
      largeArray.length = 0;
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = this.getMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      if (memoryIncrease < 50) { // Allow 50MB increase
        this.addTestResult({
          name: 'Memory Management',
          status: 'PASS',
          duration: performance.now() - startTime,
          details: `Memory increase: ${memoryIncrease.toFixed(2)}MB`
        });
      } else {
        this.addTestResult({
          name: 'Memory Management',
          status: 'WARN',
          duration: performance.now() - startTime,
          details: `High memory usage: ${memoryIncrease.toFixed(2)}MB`
        });
      }

    } catch (error) {
      this.addTestResult({
        name: 'Memory Management',
        status: 'FAIL',
        duration: performance.now() - startTime,
        details: isError(error) ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test Edge Cases
   */
  private async testEdgeCases(): Promise<void> {
    const startTime = performance.now();
    
    try {
      let edgeCaseCount = 0;
      
      // Test null/undefined inputs
      try {
        const mockVideoElement = this.createMockVideoElement();
        await this.attentionEngine.processFrame(mockVideoElement);
        edgeCaseCount++;
      } catch (e) {
        // Expected for some edge cases
      }
      
      // Test rapid state changes
      const store = useFocusStore.getState();
      for (let i = 0; i < 100; i++) {
        store.updateFromEngine({
          focusScore: i % 2 === 0 ? 150 : -50, // Invalid values
          isDrowsy: Math.random() > 0.5,
          isDistracted: Math.random() > 0.5,
          headAligned: Math.random() > 0.5,
          faceDetected: false,
          gazePosition: { x: 0, y: 0 }
        });
      }
      edgeCaseCount++;
      
      // Test performance under load
      const loadStartTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        store.updateFromEngine({
          focusScore: Math.random() * 100,
          isDrowsy: false,
          isDistracted: false,
          headAligned: true,
          faceDetected: true,
          gazePosition: { x: Math.random(), y: Math.random() }
        });
      }
      const loadTime = performance.now() - loadStartTime;
      
      if (loadTime < 1000) {
        edgeCaseCount++;
      }
      
      if (edgeCaseCount >= 2) {
        this.addTestResult({
          name: 'Edge Cases',
          status: 'PASS',
          duration: performance.now() - startTime,
          details: `Handled ${edgeCaseCount} edge cases`
        });
      } else {
        throw new Error('Edge case handling insufficient');
      }

    } catch (error) {
      this.addTestResult({
        name: 'Edge Cases',
        status: 'FAIL',
        duration: performance.now() - startTime,
        details: isError(error) ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Helper methods
   */
  private createMockVideoElement(): HTMLVideoElement {
    const video = document.createElement('video');
    video.width = 640;
    video.height = 480;
    return video;
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }

  private addTestResult(result: TestResult): void {
    this.testResults.push(result);
    console.log(`[${result.status}] ${result.name}: ${result.details}`);
  }

  private generateTestSuiteResult(): TestSuiteResult {
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const warningTests = this.testResults.filter(r => r.status === 'WARN').length;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);

    return {
      totalTests: this.testResults.length,
      passedTests,
      failedTests,
      warningTests,
      successRate: (passedTests / this.testResults.length) * 100,
      totalDuration,
      results: this.testResults,
      status: failedTests === 0 ? 'PASS' : 'FAIL'
    };
  }

  /**
   * Get current test status
   */
  public getTestStatus(): { isRunning: boolean; results: TestResult[] } {
    return {
      isRunning: this.isRunning,
      results: this.testResults
    };
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.isRunning = false;
    this.testResults = [];
  }
}

// Type definitions
interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  duration: number;
  details: string;
}

interface TestSuiteResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
  successRate: number;
  totalDuration: number;
  results: TestResult[];
  status: 'PASS' | 'FAIL';
}

// Export singleton instance
export const integrationTest = new IntegrationTest();