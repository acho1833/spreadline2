'use client';

/**
 * SpreadLineChart - React Wrapper for D3 Visualization
 *
 * This component bridges React and D3:
 * - React handles component lifecycle (mount, unmount, updates)
 * - D3 handles all SVG rendering, animations, and interactions
 *
 * Pattern: "React renders container, D3 takes over"
 */

import { useEffect, useRef, useCallback } from 'react';
import { SpreadLinesVisualizer } from './SpreadLineVisualizer';
import { SpreadLineData, SpreadLineConfig, createDefaultConfig } from './types';

interface SpreadLineChartProps {
  /**
   * The SpreadLine data to visualize
   */
  data: SpreadLineData;

  /**
   * Optional configuration overrides
   */
  config?: Partial<SpreadLineConfig>;

  /**
   * Callback when a block is expanded or collapsed
   */
  onBlockExpand?: (blockId: number, expanded: boolean) => void;

  /**
   * Callback when filtered entities change
   */
  onFilterChange?: (filteredNames: string[]) => void;

  /**
   * Custom class name for the container
   */
  className?: string;

  /**
   * Key to force re-initialization (increment to reset)
   */
  resetKey?: number;
}

export default function SpreadLineChart({
  data,
  config,
  onBlockExpand,
  onFilterChange,
  className = '',
  resetKey = 0,
}: SpreadLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const visualizerRef = useRef<SpreadLinesVisualizer | null>(null);

  /**
   * Initialize or reinitialize the D3 visualization
   */
  const initVisualization = useCallback(() => {
    if (!svgRef.current || !data) return;

    // Destroy existing visualization
    if (visualizerRef.current) {
      visualizerRef.current.destroy();
      visualizerRef.current = null;
    }

    // Clear SVG
    svgRef.current.innerHTML = '';

    // Create merged config
    const mergedConfig = { ...createDefaultConfig(), ...config };

    // Create visualizer
    const visualizer = new SpreadLinesVisualizer(data, mergedConfig);

    // Set callbacks
    visualizer.onBlockExpand = onBlockExpand;
    visualizer.onFilterChange = onFilterChange;

    // Render visualization
    visualizer.visualize(svgRef.current);

    visualizerRef.current = visualizer;
  }, [data, config, onBlockExpand, onFilterChange]);

  /**
   * Initialize on mount and when resetKey changes
   */
  useEffect(() => {
    initVisualization();

    return () => {
      // Cleanup on unmount
      if (visualizerRef.current) {
        visualizerRef.current.destroy();
        visualizerRef.current = null;
      }
    };
  }, [initVisualization, resetKey]);

  /**
   * Handle window resize
   */
  useEffect(() => {
    const handleResize = () => {
      // For now, we don't auto-resize. The visualization has fixed dimensions
      // based on the data. If needed, we could reinitialize here.
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`spreadline-chart relative ${className}`}
      style={{ position: 'relative' }}
    >
      <svg
        ref={svgRef}
        className="spreadline-svg"
        style={{
          overflow: 'visible',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      />
    </div>
  );
}

/**
 * Utility hook to access the D3 visualizer instance
 * Useful for advanced customization or imperative actions
 */
export function useSpreadLineVisualizer(
  data: SpreadLineData | null,
  config?: Partial<SpreadLineConfig>
) {
  const visualizerRef = useRef<SpreadLinesVisualizer | null>(null);

  const createVisualizer = useCallback(
    (svgElement: SVGSVGElement) => {
      if (!data) return null;

      const mergedConfig = { ...createDefaultConfig(), ...config };
      const visualizer = new SpreadLinesVisualizer(data, mergedConfig);
      visualizer.visualize(svgElement);
      visualizerRef.current = visualizer;
      return visualizer;
    },
    [data, config]
  );

  const destroyVisualizer = useCallback(() => {
    if (visualizerRef.current) {
      visualizerRef.current.destroy();
      visualizerRef.current = null;
    }
  }, []);

  return {
    visualizer: visualizerRef.current,
    createVisualizer,
    destroyVisualizer,
  };
}
