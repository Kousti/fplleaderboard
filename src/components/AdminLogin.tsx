"use client";

import { useState } from "react";

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Login failed");
      }

      onSuccess();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Login failed");
    }
  }

  return (
    <form className="suggestion-form admin-login" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="adminSecret">Admin secret</label>
        <input
          id="adminSecret"
          type="password"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      <button className="form-submit" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Signing in…" : "Sign in"}
      </button>

      {message ? <p className="form-message form-message--error">{message}</p> : null}
    </form>
  );
}
