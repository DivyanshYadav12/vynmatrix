"use client";

import { useState } from "react";
import { clearAdminKey, setAdminKey } from "@/lib/api-client";

interface LoginModalProps {
  onSuccess: () => void;
}

export function LoginModal({ onSuccess }: LoginModalProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TEMPORARY: Skip backend validation for UI testing
      // TODO: Re-enable backend validation once backend is running
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8081"}/api/ui/version`, {
      //   headers: {
      //     "X-Admin-Key": key,
      //   },
      // });

      // if (!response.ok) {
      //   throw new Error("Invalid admin key");
      // }

      // Store the key in sessionStorage
      setAdminKey(key);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-header">
          <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M5 8l7 16 4-9 4 9 7-16" />
          </svg>
          <h2>Unlock your dashboard</h2>
          <p>
            Paste the admin key of this installation. It is the value of
            <code>BACKEND_ADMIN_API_KEY</code> in your <code>.env</code> file.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="admin-key">Admin key</label>
          <input
            id="admin-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            spellCheck={false}
            autoComplete="off"
            placeholder="Enter your admin key"
          />

          {error && <div className="login-error" role="alert">{error}</div>}

          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? "Verifying..." : "Unlock"}
          </button>
        </form>

        <div className="login-warning" style={{ marginTop: "12px", padding: "10px", background: "rgba(247, 198, 107, 0.1)", border: "1px solid var(--yellow)", borderRadius: "8px", fontSize: "11px", color: "var(--yellow)" }}>
          <strong>⚠️ UI Testing Mode</strong><br />
          Backend validation is temporarily disabled. Enter any key to test the UI layout.
          Re-enable backend validation once the backend is running.
        </div>

        <p className="login-note">
          The key stays in this browser tab only, is sent to this computer only, and is forgotten
          when you close the tab or press Lock.
        </p>
      </div>
    </div>
  );
}

export function LockButton() {
  function handleLock() {
    clearAdminKey();
    window.location.reload();
  }

  return (
    <button className="icon-button" onClick={handleLock} title="Forget the admin key in this tab">
      Lock
    </button>
  );
}
