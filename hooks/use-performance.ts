"use client";

import { useEffect, useState, useCallback } from "react";

interface PerformanceMetrics {
  isSlowConnection: boolean;
  isLowEndDevice: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  memoryUsage?: number;
  connectionType?: string;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    isSlowConnection: false,
    isLowEndDevice: false,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const updateMetrics = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      const isDesktop = window.innerWidth >= 1024;

      // Check connection speed
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const isSlowConnection = connection ? 
        (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') : 
        false;

      // Check device capabilities
      const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
        (navigator as any).deviceMemory <= 2;

      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize;

      setMetrics({
        isSlowConnection,
        isLowEndDevice,
        isMobile,
        isTablet,
        isDesktop,
        memoryUsage,
        connectionType: connection?.effectiveType,
      });
    };

    updateMetrics();

    // Listen for resize events
    const handleResize = () => {
      updateMetrics();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  const shouldReduceAnimations = useCallback(() => {
    return metrics.isSlowConnection || metrics.isLowEndDevice || metrics.isMobile;
  }, [metrics]);

  const shouldLazyLoad = useCallback(() => {
    return metrics.isSlowConnection || metrics.isLowEndDevice;
  }, [metrics]);

  const getOptimalImageQuality = useCallback(() => {
    if (metrics.isSlowConnection) return 'low';
    if (metrics.isMobile) return 'medium';
    return 'high';
  }, [metrics]);

  return {
    ...metrics,
    shouldReduceAnimations,
    shouldLazyLoad,
    getOptimalImageQuality,
  };
}