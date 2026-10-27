"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Blocks, MoreHorizontal, Search, TrendingUp } from "lucide-react";
import { PageHeader, Panel, StatusBadge } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import type { StrategiesData } from "@/lib/types";

export default function StrategiesPage() {
  const [data, setData] = useState<StrategiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const strategies = await api.strategies();
        setData(strategies);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load strategies");
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="loading-state">Loading strategies...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!data) {
    return <div className="empty-state">No strategies available</div>;
  }

  const activeStrategies = data.strategies.filter((s) => s.bindings.some((b) => b.mode === "trading"));

  // Calculate total P&L grouped by currency
  const pnlByCurrency = data.strategies.reduce((acc, strategy) => {
    strategy.realized_pnl.forEach((pnl) => {
      acc[pnl.currency] = (acc[pnl.currency] || 0) + parseFloat(pnl.value);
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <PageHeader
        eyebrow="STRATEGY MANAGEMENT"
        title="Strategy Lab"
        description="View and manage your quantitative strategies and their bindings."
      />
      <div className="metrics-grid compact-metrics">
        <div className="metric-card">
          <div className="metric-top"><span>Total strategies</span><Blocks size={17} /></div>
          <div className="metric-value">{data.strategies.length.toString().padStart(2, "0")}</div>
          <div className="metric-change">Released: {data.released.toString()}</div>
        </div>
        <div className="metric-card">
          <div className="metric-top"><span>Active bindings</span><TrendingUp size={17} /></div>
          <div className="metric-value">{activeStrategies.length.toString().padStart(2, "0")}</div>
          <div className="metric-change">Running on accounts</div>
        </div>
        <div className="metric-card">
          <div className="metric-top"><span>Total P&L</span><ArrowRight size={17} /></div>
          <div className="metric-value">
            {Object.entries(pnlByCurrency)
              .map(([currency, value]) => `${value >= 0 ? "+" : ""}${currency} ${value.toLocaleString()}`)
              .join(" · ")}
          </div>
          <div className="metric-change">Realized across all strategies</div>
        </div>
        <div className="metric-card">
          <div className="metric-top"><span>Catalogue</span><ArrowRight size={17} /></div>
          <div className="metric-value">{data.catalogue.toString()}</div>
          <div className="metric-change">Available strategies</div>
        </div>
      </div>
      <Panel
        title="Your strategies"
        subtitle={`As of ${new Date(data.as_of).toLocaleString()}`}
      >
        <div className="table-tools">
          <label className="table-search"><Search size={15} /><input placeholder="Search strategies..." /></label>
          <div className="filter-chip">All strategies <span>{data.strategies.length}</span></div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>STRATEGY</th>
                <th>ASSET CLASS</th>
                <th>VERSION</th>
                <th>STATUS</th>
                <th>BINDINGS</th>
                <th>REALIZED P&L</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.strategies.map((s) => (
                <tr key={s.strategy_id}>
                  <td>
                    <div className="table-primary">
                      <span className="table-symbol"><TrendingUp size={16} /></span>
                      <div>
                        <strong>{s.name}</strong>
                        <span>{s.strategy_id}</span>
                      </div>
                    </div>
                  </td>
                  <td><strong>{s.asset_class}</strong></td>
                  <td><span className="version-code">{s.version || "—"}</span></td>
                  <td>
                    <StatusBadge tone={s.released ? "success" : "neutral"}>
                      {s.released ? "Released" : "Draft"}
                    </StatusBadge>
                  </td>
                  <td>
                    <span className="muted-number">{s.bindings.length} binding{s.bindings.length !== 1 ? "s" : ""}</span>
                  </td>
                  <td>
                    {(() => {
                      const strategyPnl = s.realized_pnl.reduce((sum, pnl) => sum + parseFloat(pnl.value), 0);
                      return (
                        <span className={strategyPnl >= 0 ? "positive-number" : "negative-number"}>
                          {s.realized_pnl.length > 0
                            ? `${strategyPnl >= 0 ? "+" : ""}${s.realized_pnl[0]?.currency || ""} ${strategyPnl.toLocaleString()}`
                            : "—"}
                        </span>
                      );
                    })()}
                  </td>
                  <td>
                    <button className="icon-button" aria-label={`More actions for ${s.name}`}>
                      <MoreHorizontal size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
