"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { getMuleGraph, MuleGraphResponse } from "@/lib/api";
import { Activity, ShieldAlert, Layers } from "lucide-react";

// Dynamically import ForceGraph2D with ssr: false
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export function MuleGraphView() {
  const [data, setData] = useState<MuleGraphResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [kHops, setKHops] = useState<number>(4);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    loadGraph(kHops);
  }, [kHops]);

  const loadGraph = async (hops: number) => {
    setLoading(true);
    try {
      const graph = await getMuleGraph(hops);
      setData(graph);
    } catch (e: any) {
      console.error("Failed to load mule graph:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#1F2430]">Interactive Mule-Ring Topology (k ≤ 4 Hops)</h2>
            <span className="text-xs bg-[#FEE2E2] text-[#DC2626] font-semibold px-2.5 py-0.5 rounded-full">
              FR4 Centrality Alert
            </span>
          </div>
          <p className="text-xs text-[#586071] mt-1">
            Accounts with Directed In-Degree Centrality <code className="text-[#DC2626]">C_D⁺ &gt; 0.05</code> or PageRank <code className="text-[#DC2626]">PR &gt; 0.015</code> illuminate in bright red.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#6B7280]">Hop Boundary:</span>
          {[2, 3, 4].map((h) => (
            <button
              key={h}
              onClick={() => setKHops(h)}
              className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
                kHops === h ? "bg-[#435278] text-white" : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
              }`}
            >
              k = {h}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-[#F1F3F5]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
          <span className="text-[#4B5563]">Victim Origin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          <span className="text-[#4B5563]">Intermediate Mule</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#DC2626] animate-pulse" />
          <span className="text-[#DC2626] font-semibold">Flagged Mule Hub (Centrality / PR)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <span className="text-[#4B5563]">Cash-Out Point (ATM / CDM / Agent)</span>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative border border-[#E5E7EB] rounded-xl overflow-hidden bg-[#0F172A] h-[450px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-white/60 text-xs">
            Calculating Network Centrality & Rendering Graph...
          </div>
        ) : data ? (
          <ForceGraph2D
            graphData={{
              nodes: data.nodes,
              links: data.links,
            }}
            width={780}
            height={450}
            nodeLabel={(node: any) => `${node.name}\nCentrality: ${node.in_degree_centrality}\nPageRank: ${node.pagerank}`}
            nodeColor={(node: any) => node.color}
            nodeVal={(node: any) => node.val}
            linkColor={() => "rgba(255, 255, 255, 0.25)"}
            linkWidth={(link: any) => Math.max(1, link.value / 3)}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.006}
            onNodeClick={(node: any) => setSelectedNode(node)}
          />
        ) : null}

        {/* Selected Node Details Overlay */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-[#E5E7EB] p-3 rounded-xl shadow-lg text-xs max-w-xs space-y-1">
            <div className="font-bold text-[#1F2430] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedNode.color }} />
              {selectedNode.name}
            </div>
            <div className="text-[11px] text-[#6B7280]">Type: {selectedNode.type}</div>
            <div className="text-[11px] text-[#374151]">
              In-Degree Centrality: <span className="font-mono font-semibold">{selectedNode.in_degree_centrality}</span>
            </div>
            <div className="text-[11px] text-[#374151]">
              PageRank Score: <span className="font-mono font-semibold">{selectedNode.pagerank}</span>
            </div>
            {selectedNode.is_flagged_mule && (
              <span className="inline-block mt-1 bg-[#FEE2E2] text-[#DC2626] font-semibold text-[10px] px-2 py-0.5 rounded">
                MULE NODE OVERRIDE ACTIVE
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
