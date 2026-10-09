import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, Search, RefreshCw, X, User, Building2, Briefcase,
  Clock, ShieldAlert, ArrowLeft, Loader2, CheckCheck, Eye
} from "lucide-react";
import {
  adminApi, AdminConversation, AdminConversationDetail, AdminMessage
} from "../../lib/adminApi";

type FilterType = "all" | "recent" | "unread";

export function AdminMessagesPanel() {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminConversationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(false);

  // Load conversation list
  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await adminApi.listConversations({
        search: search || undefined,
        filter: filter === "all" ? undefined : filter,
        page,
        limit: 15,
      });
      setConversations(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, filter, page]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load single conversation detail
  const loadDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    setDetailError(false);
    try {
      const res = await adminApi.getConversationDetails(id);
      setDetail(res.data.data);
    } catch {
      setDetailError(true);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    loadDetail(id);
  };

  const selectedConvSummary = conversations.find((c) => c.id === selectedId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.995 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* ── Control Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-base-muted/30 p-3 rounded-2xl border border-base-border">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search by student name, workshop, or job title…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-9 py-2 bg-base-surface border border-base-border rounded-xl text-xs text-ink-primary placeholder-ink-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills & Manual Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex bg-base-surface border border-base-border rounded-xl p-1 text-xs">
            {(
              [
                { id: "all", label: "All Logs" },
                { id: "recent", label: "Recent Activity" },
                { id: "unread", label: "Unread" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filter === f.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-base-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              loadConversations();
              if (selectedId) loadDetail(selectedId);
            }}
            className="p-2 rounded-xl bg-base-surface hover:bg-base-border/50 text-ink-secondary hover:text-ink-primary border border-base-border transition-all"
            title="Refresh conversations"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
          </button>
        </div>
      </div>

      {/* ── Two-Panel Monitoring Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[520px]">
        {/* LEFT PANEL: Conversation List */}
        <div
          className={`md:col-span-5 lg:col-span-4 bg-base-surface border border-base-border rounded-2xl overflow-hidden flex flex-col shadow-card ${
            selectedId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Panel Sub-header */}
          <div className="p-3.5 border-b border-base-border bg-base-muted/40 flex items-center justify-between">
            <span className="text-xs font-bold text-ink-primary flex items-center gap-1.5 uppercase tracking-wider">
              <MessageSquare size={14} className="text-blue-500" />
              Conversations ({conversations.length})
            </span>
            <span className="text-[10px] font-semibold text-ink-muted px-2 py-0.5 rounded-full bg-base-surface border border-base-border">
              Read-Only
            </span>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-base-border/60 max-h-[580px]">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-base-muted/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-xs text-red-500">
                <ShieldAlert size={28} className="mx-auto mb-2 opacity-60" />
                <p className="font-semibold">Failed to load message audit log</p>
                <button
                  onClick={loadConversations}
                  className="mt-3 px-3 py-1 bg-red-500/10 text-red-500 rounded-lg font-bold hover:bg-red-500/20 transition-all"
                >
                  Retry
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-10 text-center text-ink-muted">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-bold text-ink-primary">No conversations found</p>
                <p className="text-[11px] mt-1">There are no active candidate-employer chats matching this query.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === selectedId;
                return (
                  <motion.div
                    key={conv.id}
                    whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.04)" }}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`p-3.5 cursor-pointer transition-all border-l-4 ${
                      isSelected
                        ? "bg-blue-500/10 border-l-blue-600 dark:border-l-blue-400"
                        : "border-l-transparent hover:border-l-base-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                        <span className="text-xs font-bold text-ink-primary truncate">
                          {conv.student.name}
                        </span>
                        <span className="text-[10px] text-ink-muted font-normal">w/</span>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
                          {conv.employer.workshopName}
                        </span>
                      </div>
                      <span className="text-[10px] text-ink-muted whitespace-nowrap">
                        {new Date(conv.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Related Job Title */}
                    <div className="flex items-center gap-1 text-[11px] text-ink-secondary mb-1.5 truncate">
                      <Briefcase size={12} className="text-ink-muted shrink-0" />
                      <span className="truncate">{conv.job.title}</span>
                    </div>

                    {/* Latest Message Preview */}
                    <div className="flex items-center justify-between text-[11px] text-ink-muted">
                      <p className="truncate pr-2 italic">
                        {conv.latestMessage?.content ? `"${conv.latestMessage.content}"` : "No messages yet"}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.2 bg-indigo-500 text-white rounded-full">
                          {conv.unreadCount} unread
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* List Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-base-border bg-base-muted/30 flex items-center justify-between text-xs">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg bg-base-surface border border-base-border text-ink-secondary hover:text-ink-primary disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-[11px] text-ink-muted">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg bg-base-surface border border-base-border text-ink-secondary hover:text-ink-primary disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Conversation Viewer */}
        <div
          className={`md:col-span-7 lg:col-span-8 bg-base-surface border border-base-border rounded-2xl overflow-hidden flex flex-col shadow-card ${
            selectedId ? "flex" : "hidden md:flex"
          }`}
        >
          {!selectedId ? (
            /* No conversation selected state */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-ink-muted">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center mb-3">
                <Eye size={30} />
              </div>
              <h3 className="text-sm font-bold text-ink-primary">Admin Conversation Monitor</h3>
              <p className="text-xs text-ink-muted mt-1 max-w-sm">
                Select a conversation from the list on the left to inspect candidate-employer chat logs, participant credentials, and job context.
              </p>
            </div>
          ) : (
            /* Conversation Viewer Content */
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Top Header & Mobile Back Button */}
              <div className="p-4 border-b border-base-border bg-base-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="md:hidden p-1.5 rounded-xl bg-base-surface border border-base-border text-ink-primary hover:bg-base-muted transition-all"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-ink-primary">
                        {detail?.job.title ?? selectedConvSummary?.job.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {detail?.job.jobType ?? "Job Posting"}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted flex items-center gap-1.5 mt-0.5">
                      <span>Location: {detail?.job.location ?? selectedConvSummary?.job.location}</span>
                    </p>
                  </div>
                </div>

                {/* Read-Only Badge Banner */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold shrink-0">
                  <Eye size={13} />
                  <span>READ-ONLY MONITORING MODE</span>
                </div>
              </div>

              {/* Participants Context Cards Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-base-muted/20 border-b border-base-border">
                {/* Student Box */}
                <div className="bg-base-surface p-3 rounded-xl border border-base-border/80 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Candidate (Student)</span>
                    <p className="font-bold text-ink-primary truncate">{detail?.student.name ?? selectedConvSummary?.student.name}</p>
                    <p className="text-[11px] text-ink-muted truncate">{detail?.student.user.email ?? selectedConvSummary?.student.user.email}</p>
                  </div>
                </div>

                {/* Employer Box */}
                <div className="bg-base-surface p-3 rounded-xl border border-base-border/80 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Employer (Workshop)</span>
                    <p className="font-bold text-ink-primary truncate">{detail?.employer.workshopName ?? selectedConvSummary?.employer.workshopName}</p>
                    <p className="text-[11px] text-ink-muted truncate">{detail?.employer.user.email ?? selectedConvSummary?.employer.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Messages Timeline */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px] bg-base-bg/50">
                {loadingDetail ? (
                  <div className="py-16 text-center">
                    <Loader2 size={26} className="animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <span className="text-xs text-ink-muted">Loading audit transcripts…</span>
                  </div>
                ) : detailError ? (
                  <div className="py-12 text-center text-xs text-red-500">
                    <ShieldAlert size={28} className="mx-auto mb-2 opacity-60" />
                    <p className="font-semibold">Failed to fetch conversation details</p>
                    <button
                      onClick={() => selectedId && loadDetail(selectedId)}
                      className="mt-3 px-3 py-1 bg-red-500/10 text-red-500 rounded-lg font-bold hover:bg-red-500/20 transition-all"
                    >
                      Retry
                    </button>
                  </div>
                ) : !detail || detail.messages.length === 0 ? (
                  <div className="py-16 text-center text-xs text-ink-muted">
                    <Clock size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-ink-primary">No messages exchange recorded yet</p>
                    <p className="mt-0.5">This conversation room has been opened but no messages have been sent.</p>
                  </div>
                ) : (
                  detail.messages.map((msg: AdminMessage) => {
                    const isStudent = msg.sender.role === "student";

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isStudent ? "items-start" : "items-end"}`}
                      >
                        {/* Sender Label & Avatar */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-semibold text-ink-muted">
                          {isStudent ? (
                            <>
                              <span className="w-4 h-4 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center text-[9px] font-bold">
                                S
                              </span>
                              <span className="text-ink-primary font-bold">{detail.student.name}</span>
                              <span className="text-[10px] font-normal text-ink-muted">(Student Candidate)</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] font-normal text-ink-muted">(Employer Workshop)</span>
                              <span className="text-ink-primary font-bold">{detail.employer.workshopName}</span>
                              <span className="w-4 h-4 rounded-full bg-indigo-500/15 text-indigo-600 flex items-center justify-center text-[9px] font-bold">
                                E
                              </span>
                            </>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs shadow-sm border ${
                            isStudent
                              ? "bg-base-surface text-ink-primary border-base-border rounded-tl-none"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600/30 rounded-tr-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>

                        {/* Timestamp & Read Indicator */}
                        <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-ink-muted">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>•</span>
                          <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                          {msg.isRead && (
                            <span className="inline-flex items-center gap-0.5 text-emerald-500 font-medium">
                              • <CheckCheck size={11} /> Read
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Footer Notice (Confirms Read-Only Monitoring) */}
              <div className="p-3 border-t border-base-border bg-base-muted/50 flex items-center justify-between text-[11px] text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-blue-500" />
                  Admin Read-Only Observer. You cannot post or modify messages in participant conversations.
                </span>
                <span className="hidden sm:inline font-mono text-[10px]">
                  ID: {detail?.id ?? selectedId}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
