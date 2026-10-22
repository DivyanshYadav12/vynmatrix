"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, User, Database, TrendingUp } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";
import type { ControlData } from "@/lib/types";

export default function SettingsPage() {
  const [data, setData] = useState<ControlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const control = await api.control();
        setData(control);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load settings");
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="loading-state">Loading settings...</div>;
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
    return <div className="empty-state">No settings data available</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="WORKSPACE CONFIGURATION"
        title="Settings"
        description="Manage your owner profile, broker accounts, and risk parameters."
      />
      <div className="settings-layout">
        <nav className="settings-nav">
          <button className="settings-nav-item active">Owner Profile</button>
          <button className="settings-nav-item">Broker Accounts</button>
          <button className="settings-nav-item">Strategy Bindings</button>
          <button className="settings-nav-item">Risk Limits</button>
        </nav>
        <div className="settings-content">
          <Panel title="Owner profile" subtitle="Account owner information">
            <div className="form-grid">
              <div className="form-field">
                <label>Display name</label>
                <input type="text" defaultValue={data.owner?.display_name || ""} disabled />
              </div>
              <div className="form-field">
                <label>Base currency</label>
                <input type="text" defaultValue={data.owner?.base_currency || ""} disabled />
              </div>
              <div className="form-field">
                <label>Timezone</label>
                <input type="text" defaultValue={data.owner?.timezone || ""} disabled />
              </div>
            </div>
            <div className="info-note" style={{ marginTop: "16px" }}>
              Owner profile changes require direct backend access. Contact the system administrator.
            </div>
          </Panel>

          <Panel title="Broker accounts" subtitle="Connected broker accounts and credentials">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ACCOUNT</th>
                    <th>BROKER</th>
                    <th>ENVIRONMENT</th>
                    <th>CURRENCY</th>
                    <th>STATUS</th>
                    <th>CREDENTIALS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.accounts.map((account) => (
                    <tr key={account.account_id}>
                      <td>
                        <div className="table-primary">
                          <span className="table-symbol"><Database size={16} /></span>
                          <div>
                            <strong>{account.display_name}</strong>
                            <span>ID: {account.account_id}</span>
                          </div>
                        </div>
                      </td>
                      <td><strong>{account.broker_name}</strong></td>
                      <td><span className="version-code">{account.environment}</span></td>
                      <td>{account.base_ccy}</td>
                      <td>
                        <span className={account.status === "active" ? "positive-number" : "negative-number"}>
                          {account.status}
                        </span>
                      </td>
                      <td>
                        {account.credential.present ? (
                          <span className="positive-number">✓ Present</span>
                        ) : (
                          <span className="negative-number">✗ Missing</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Strategy bindings" subtitle="Active strategy-to-account bindings">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>BINDING ID</th>
                    <th>STRATEGY</th>
                    <th>ACCOUNT</th>
                    <th>MODE</th>
                    <th>ACTIVE</th>
                    <th>MAX POSITION</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bindings.map((binding) => (
                    <tr key={binding.binding_id}>
                      <td><strong>#{binding.binding_id}</strong></td>
                      <td>{binding.strategy_id}</td>
                      <td>Account #{binding.account_id}</td>
                      <td><span className="version-code">{binding.mode}</span></td>
                      <td>
                        {binding.active ? (
                          <span className="positive-number">✓ Active</span>
                        ) : (
                          <span className="muted-number">Inactive</span>
                        )}
                      </td>
                      <td>{binding.max_position_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Available strategies" subtitle="Strategies available for binding">
            <div className="strategy-health-list">
              {data.strategies.map((strategy) => (
                <div className="strategy-health-item" key={strategy.strategy_id}>
                  <div className="strategy-symbol"><TrendingUp size={17} /></div>
                  <div className="strategy-health-copy">
                    <strong>{strategy.name}</strong>
                    <span>{strategy.strategy_id} · {strategy.asset_class}</span>
                  </div>
                  <div className="strategy-health-status">
                    <span className={strategy.released ? "positive-number" : "muted-number"}>
                      {strategy.released ? "Released" : "Draft"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
