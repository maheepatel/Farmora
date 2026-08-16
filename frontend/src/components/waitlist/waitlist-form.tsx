"use client";

import { useState, FormEvent } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, hp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setMessage("You're on the list! We'll be in touch soon.");
      setName("");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="waitlist-name" className="block text-sm font-semibold text-ink-900">
          Name
        </label>
        <input
          id="waitlist-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          disabled={status === "loading" || status === "success"}
          className="w-full rounded-xl border-2 border-ink-800 bg-white px-4 py-3 text-lg font-semibold text-ink-900 placeholder-zinc-400 transition-colors focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="waitlist-email" className="block text-sm font-semibold text-ink-900">
          Email
        </label>
        <input
          id="waitlist-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={status === "loading" || status === "success"}
          className="w-full rounded-xl border-2 border-ink-800 bg-white px-4 py-3 text-lg font-semibold text-ink-900 placeholder-zinc-400 transition-colors focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <input type="hidden" name="hp" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" style={{ display: "none" }} />

      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="w-full sticker-btn sticker-btn-primary !py-4 text-lg"
      >
        {status === "loading" && (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Joining...
          </>
        )}
        {status !== "loading" && "Join the Waitlist"}
      </button>

      {message && (
        <div
          className={`flex items-center gap-2 text-sm font-semibold ${
            status === "success" ? "text-emerald-700" : "text-rose-700"
          }`}
          role="alert"
        >
          {status === "success" ? <Check className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
          {message}
        </div>
      )}

      <p className="text-xs text-zinc-500 text-center">
        No spam, ever. Unsubscribe anytime.
      </p>
    </form>
  );
}