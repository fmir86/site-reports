"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/pages/Login.module.scss";
import cardStyles from "@/styles/components/Card.module.scss";
import inputStyles from "@/styles/components/Input.module.scss";
import buttonStyles from "@/styles/components/Button.module.scss";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push(redirectUrl);
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={`${cardStyles.card} ${cardStyles.cardPadded}`}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.alertError}>{error}</div>}

        <div className={inputStyles.inputWrapper}>
          <label htmlFor="password" className={inputStyles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputStyles.input}
            placeholder="Enter site password"
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.md} ${buttonStyles.fullWidth}`}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
