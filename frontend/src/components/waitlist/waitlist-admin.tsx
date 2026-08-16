"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Trash2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  ip?: string;
}

export function WaitlistAdmin() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/waitlist", {
        headers: { "x-admin-secret": process.env.NEXT_PUBLIC_WAITLIST_ADMIN_SECRET || "" },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (e) {
      setError("Failed to load waitlist entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleExport = () => {
    const csv = [
      ["ID", "Name", "Email", "Joined At", "IP"],
      ...entries.map((e) => [e.id, e.name, e.email, new Date(e.createdAt).toLocaleString(), e.ip || ""]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `farmora-waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(email);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (loading) {
    return (
      <div className="sticker-card bg-white p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
        <p className="mt-3 text-sm font-semibold text-zinc-500">Loading waitlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sticker-card bg-white p-8 text-center">
        <p className="text-sm font-semibold text-rose-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="sticker-card bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-ink-800 bg-ink-50 px-6 py-4">
        <h3 className="font-heading text-lg font-bold text-ink-900">
          Waitlist ({entries.length})
        </h3>
        <button
          onClick={handleExport}
          className="sticker-btn sticker-btn-outline !px-4 !py-2 text-sm flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="p-12 text-center text-zinc-500">
          <p className="font-semibold">No waitlist entries yet.</p>
          <p className="text-sm mt-1">They'll appear here when people sign up.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-ink-800 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="pb-2 pr-4">Joined</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">IP</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b-2 border-ink-100 hover:bg-ink-50/50">
                  <td className="py-3 pr-4 font-mono text-xs text-zinc-600">{formatDate(entry.createdAt)}</td>
                  <td className="py-3 pr-4 font-semibold text-ink-900">{entry.name}</td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => handleCopyEmail(entry.email)}
                      className="flex items-center gap-1.5 text-zinc-700 hover:text-primary-600 transition-colors"
                    >
                      {entry.email}
                      {copiedId === entry.email && (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{entry.ip || "—"}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleCopyEmail(entry.email)}
                      className="sticker-btn sticker-btn-outline !px-3 !py-1.5 !text-xs flex items-center gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}