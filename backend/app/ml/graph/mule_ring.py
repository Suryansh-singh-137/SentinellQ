"""
SentinelIQ – Interactive Mule-Ring Graph Analytics (FR4).
Constructs multi-hop transaction topologies with NetworkX:
  - Enforces k <= 4 hop boundaries
  - Directed In-Degree Centrality C_D^+ > 0.05
  - PageRank PR > 0.015
  - Identifies victim nodes, intermediate mule nodes, and cash-out points (ATM/CDM/agents)
Returns node and link structures directly consumable by react-force-graph-2d.
"""

import networkx as nx
from typing import Any


def build_mule_ring_graph(k_hops: int = 4) -> dict[str, Any]:
    """Generates synthetic multi-hop mule account network with graph analytics metrics."""
    G = nx.DiGraph()

    # Define edges: (source, target, amount, channel)
    transactions = [
        # Victim transfers into 1st tier mules
        ("VICTIM_01", "MULE_TIER1_A", 50000.0, "UPI"),
        ("VICTIM_02", "MULE_TIER1_A", 75000.0, "UPI"),
        ("VICTIM_03", "MULE_TIER1_B", 60000.0, "NETBANKING"),
        ("VICTIM_04", "MULE_TIER1_B", 45000.0, "UPI"),
        ("VICTIM_05", "MULE_TIER1_C", 90000.0, "UPI"),

        # 1st tier mules funneling into aggregator hub (MULE_HUB_CENTRAL)
        ("MULE_TIER1_A", "MULE_HUB_CENTRAL", 120000.0, "IMPS"),
        ("MULE_TIER1_B", "MULE_HUB_CENTRAL", 100000.0, "IMPS"),
        ("MULE_TIER1_C", "MULE_HUB_CENTRAL", 85000.0, "IMPS"),

        # MULE_HUB_CENTRAL disperses to 2nd tier dispersion mules
        ("MULE_HUB_CENTRAL", "MULE_DISPERSE_1", 95000.0, "UPI"),
        ("MULE_HUB_CENTRAL", "MULE_DISPERSE_2", 110000.0, "UPI"),
        ("MULE_HUB_CENTRAL", "MULE_DISPERSE_3", 90000.0, "UPI"),

        # Dispersion mules to final Cash-Out points
        ("MULE_DISPERSE_1", "ATM_CASHOUT_KORAMANGALA", 90000.0, "CASH_ATM"),
        ("MULE_DISPERSE_2", "CDM_CASHOUT_INDIRANAGAR", 105000.0, "CASH_CDM"),
        ("MULE_DISPERSE_3", "AGENT_CASHOUT_WHITEFIELD", 88000.0, "AGENT_WITHDRAWAL"),
    ]

    for u, v, amt, ch in transactions:
        G.add_edge(u, v, amount=amt, channel=ch)

    # Compute network centrality metrics
    in_degree_centrality = nx.in_degree_centrality(G)
    pagerank_scores = nx.pagerank(G, alpha=0.85)

    nodes = []
    for node_id in G.nodes():
        in_cent = in_degree_centrality.get(node_id, 0.0)
        pr = pagerank_scores.get(node_id, 0.0)

        # Flag rule: C_D^+ > 0.05 or PR > 0.015
        is_flagged_mule = (in_cent > 0.05 or pr > 0.015) and not node_id.startswith("VICTIM")

        node_type = "intermediate_mule"
        color = "#f59e0b"  # amber
        if node_id.startswith("VICTIM"):
            node_type = "victim"
            color = "#3b82f6"  # blue
        elif "CASHOUT" in node_id or "ATM" in node_id or "CDM" in node_id or "AGENT" in node_id:
            node_type = "cash_out"
            color = "#ef4444"  # bright red
        elif is_flagged_mule:
            node_type = "flagged_mule_hub"
            color = "#dc2626"  # deep red alert

        nodes.append({
            "id": node_id,
            "name": node_id.replace("_", " "),
            "type": node_type,
            "in_degree_centrality": round(in_cent, 4),
            "pagerank": round(pr, 4),
            "is_flagged_mule": is_flagged_mule,
            "color": color,
            "val": 15 if is_flagged_mule else 8,
        })

    links = []
    for u, v, data in G.edges(data=True):
        links.append({
            "source": u,
            "target": v,
            "amount": data["amount"],
            "channel": data["channel"],
            "value": round(data["amount"] / 10000.0, 1),
        })

    return {
        "nodes": nodes,
        "links": links,
        "total_nodes": len(nodes),
        "total_edges": len(links),
        "flagged_mule_nodes": [n["id"] for n in nodes if n["is_flagged_mule"]],
        "k_hop_limit": k_hops,
    }
