"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { getMuleGraph, MuleGraphResponse, MuleNode } from "@/lib/api";
import { RefreshCw, ZoomIn, ZoomOut, Maximize2, Info, Network } from "lucide-react";

// Dynamically import ForceGraph2D with ssr: false so it only runs client-side
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface MuleGraphViewProps {
  /** If true, auto-refresh the graph every `refreshInterval` ms */
  autoRefresh?: boolean;
  /** Interval for auto-refresh in ms (default 30s) */
  refreshInterval?: number;
  /** Height of the canvas in pixels (default 500) */
  height?: number;
}

export function MuleGraphView({
  autoRefresh = false,
  refreshInterval = 30000,
  height = 500,
}: MuleGraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  const [data, setData] = useState<MuleGraphResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [kHops, setKHops] = useState<number>(4);
  const [selectedNode, setSelectedNode] = useState<MuleNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<MuleNode | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [highlight, setHighlight] = useState<Set<string>>(new Set());
  const [showStats, setShowStats] = useState<boolean>(true);

  // Resize observer to make graph fully responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width ?? 800;
      setContainerWidth(Math.floor(width));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const loadGraph = useCallback(async (hops: number) => {
    setLoading(true);
    try {
      const graph = await getMuleGraph(hops);
      setData(graph);
      setLastRefreshed(new Date());
      setSelectedNode(null);
      setHighlight(new Set());
    } catch (e: any) {
      console.error("Failed to load mule graph:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraph(kHops);
  }, [kHops, loadGraph]);

  // Auto-refresh support
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => loadGraph(kHops), refreshInterval);
    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, kHops, loadGraph]);

  // Build neighbour highlight set on node click
  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node as MuleNode);
    if (!data) return;
    const neighbours = new Set<string>([node.id as string]);
    data.links.forEach((link) => {
      const s = typeof link.source === "object" ? (link.source as any).id : link.source;
      const t = typeof link.target === "object" ? (link.target as any).id : link.target;
      if (s === node.id) neighbours.add(t as string);
      if (t === node.id) neighbours.add(s as string);
    });
    setHighlight(neighbours);
  }, [data]);

  // Node paint function – dims non-highlighted nodes when a node is selected
  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isHighlighted = highlight.size === 0 || highlight.has(node.id);
      const r = (node.val ?? 8) / Math.max(1, globalScale * 0.5);
      const alpha = isHighlighted ? 1 : 0.2;

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = node.color || "#6B7280";
      ctx.fill();

      // Glow ring for flagged mule hubs
      if (node.is_flagged_mule) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 3, 0, 2 * Math.PI);
        ctx.strokeStyle = "#DC2626";
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

      // Node label
      if (globalScale > 1.2 || node.val > 10) {
        const label = (node.name as string).replace(/_/g, " ");
        ctx.font = `${Math.max(10, 12 / globalScale)}px 'Inter', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(label, node.x, node.y + r + 2 / globalScale);
      }

      ctx.globalAlpha = 1;
    },
    [highlight]
  );

  const stats = data
    ? {
        victims: data.nodes.filter((n) => n.type === "victim").length,
        mules: data.nodes.filter((n) => n.type === "intermediate_mule" || n.type === "flagged_mule_hub").length,
        cashOuts: data.nodes.filter((n) => n.type === "cash_out").length,
        flagged: data.flagged_mule_nodes?.length ?? 0,
        totalAmount: data.links.reduce((sum, l) => sum + (l.amount ?? 0), 0),
      }
    : null;

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-[#435278]" />
            <h2 className="text-lg font-bold text-[#1F2430]">
              Interactive Mule-Ring Topology (k ≤ {kHops} Hops)
            </h2>
            <span className="text-xs bg-[#FEE2E2] text-[#DC2626] font-semibold px-2.5 py-0.5 rounded-full">
              FR4 Centrality Alert
            </span>
          </div>
          <p className="text-xs text-[#586071] mt-1">
            Nodes with Directed In-Degree Centrality{" "}
            <code className="text-[#DC2626]">C_D⁺ &gt; 0.05</code> or PageRank{" "}
            <code className="text-[#DC2626]">PR &gt; 0.015</code> are flagged in red.
            Click any node to highlight its connections.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Hop boundary buttons */}
          <span className="text-xs text-[#6B7280]">Hops:</span>
          {[2, 3, 4].map((h) => (
            <button
              key={h}
              onClick={() => setKHops(h)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                kHops === h
                  ? "bg-[#435278] text-white shadow-sm"
                  : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
              }`}
            >
              k = {h}
            </button>
          ))}

          {/* Stats toggle */}
          <button
            onClick={() => setShowStats((v) => !v)}
            title="Toggle stats overlay"
            className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563]"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Zoom to fit */}
          <button
            onClick={() => graphRef.current?.zoomToFit(400, 40)}
            title="Zoom to fit"
            className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563]"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Refresh */}
          <button
            onClick={() => loadGraph(kHops)}
            disabled={loading}
            title="Refresh graph data"
            className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs pt-2 pb-1 border-t border-[#F1F3F5]">
        {[
          { color: "#3B82F6", label: "Victim Origin" },
          { color: "#F59E0B", label: "Intermediate Mule" },
          { color: "#DC2626", label: "Flagged Hub (C_D⁺ / PR)", pulse: true },
          { color: "#EF4444", label: "Cash-Out (ATM/CDM/Agent)" },
        ].map(({ color, label, pulse }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className={`w-3 h-3 rounded-full flex-shrink-0 ${pulse ? "animate-pulse" : ""}`}
              style={{ backgroundColor: color }}
            />
            <span className={pulse ? "text-[#DC2626] font-semibold" : "text-[#4B5563]"}>{label}</span>
          </div>
        ))}
        <span className="ml-auto text-[11px] font-mono text-[#9CA3AF]">
          Last refreshed: {lastRefreshed.toLocaleTimeString()}
        </span>
      </div>

      {/* Main Canvas + Stats Overlay */}
      <div className="relative" ref={containerRef}>
        {/* Stats overlay */}
        {showStats && stats && !loading && (
          <div className="absolute top-3 left-3 z-10 bg-[#0F172A]/90 backdrop-blur-sm rounded-xl p-3 text-[11px] font-mono space-y-1 shadow-lg">
            <div className="text-white/50 uppercase tracking-wider mb-1 text-[10px]">Network Stats</div>
            <div className="text-white/80">
              <span className="text-[#93C5FD]">{data?.total_nodes}</span> nodes · <span className="text-[#93C5FD]">{data?.total_edges}</span> edges
            </div>
            <div className="text-white/80">
              <span className="text-[#3B82F6]">{stats.victims}</span> victims ·{" "}
              <span className="text-[#F59E0B]">{stats.mules}</span> mules ·{" "}
              <span className="text-[#EF4444]">{stats.cashOuts}</span> cash-outs
            </div>
            <div className="text-white/80">
              <span className="text-[#DC2626] font-bold">{stats.flagged}</span> flagged hubs
            </div>
            <div className="text-white/80">
              Total: <span className="text-[#4ADE80]">₹{stats.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Selected node details */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md border border-[#E5E7EB] p-3.5 rounded-xl shadow-lg text-xs max-w-xs space-y-1.5">
            <div className="font-bold text-[#1F2430] flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedNode.color }}
              />
              {selectedNode.name.replace(/_/g, " ")}
              <button
                onClick={() => { setSelectedNode(null); setHighlight(new Set()); }}
                className="ml-auto text-[#9CA3AF] hover:text-[#374151] text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="text-[11px] text-[#6B7280] capitalize">
              Type: <strong>{selectedNode.type.replace(/_/g, " ")}</strong>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#374151]">In-Degree Centrality</span>
              <span className="font-mono font-bold text-[#435278]">{selectedNode.in_degree_centrality}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#374151]">PageRank Score</span>
              <span className="font-mono font-bold text-[#435278]">{selectedNode.pagerank}</span>
            </div>
            {selectedNode.is_flagged_mule && (
              <span className="inline-block mt-1 bg-[#FEE2E2] text-[#DC2626] font-semibold text-[10px] px-2 py-0.5 rounded">
                MULE NODE OVERRIDE ACTIVE
              </span>
            )}
          </div>
        )}

        {/* Graph canvas */}
        <div
          className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-[#0F172A]"
          style={{ height }}
        >
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-white/60 text-xs">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
              <span>Calculating Network Centrality & Rendering Graph...</span>
            </div>
          ) : data ? (
            <ForceGraph2D
              ref={graphRef}
              graphData={{ nodes: data.nodes, links: data.links }}
              width={containerWidth}
              height={height}
              nodeLabel={(node: any) =>
                `${node.name}\nType: ${node.type}\nCentrality: ${node.in_degree_centrality}\nPageRank: ${node.pagerank}`
              }
              nodeCanvasObject={paintNode}
              nodeCanvasObjectMode={() => "replace"}
              linkColor={(link: any) => {
                const s = typeof link.source === "object" ? link.source.id : link.source;
                const t = typeof link.target === "object" ? link.target.id : link.target;
                if (highlight.size === 0) return "rgba(255,255,255,0.2)";
                return highlight.has(s) && highlight.has(t) ? "rgba(99,179,237,0.8)" : "rgba(255,255,255,0.05)";
              }}
              linkWidth={(link: any) => Math.max(1, (link.value ?? 1) / 3)}
              linkDirectionalParticles={3}
              linkDirectionalParticleSpeed={0.005}
              linkDirectionalParticleWidth={2}
              onNodeClick={handleNodeClick}
              onNodeHover={(node: any) => setHoveredNode(node)}
              backgroundColor="#0F172A"
              cooldownTicks={100}
              onEngineStop={() => graphRef.current?.zoomToFit(400, 40)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-white/40 text-xs">
              Failed to load graph data. Click refresh to retry.
            </div>
          )}
        </div>

        {/* Instruction hint */}
        {!loading && data && !selectedNode && (
          <p className="text-[11px] text-[#9CA3AF] text-center mt-2">
            Click any node to inspect its connections · Scroll to zoom · Drag to pan
          </p>
        )}
      </div>
    </div>
  );
}
