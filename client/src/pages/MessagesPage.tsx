import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ConversationDto, MessageDto } from "@iti-portal/shared";
import { messageApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { AppNavbar } from "../components/ui/AppNavbar";
import { PageHeader } from "../components/ui/PageHeader";
import {
  MessageSquare, Send, Check, CheckCheck, Briefcase, Search,
  ArrowLeft, RefreshCw, AlertCircle, Loader2, ArrowDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationDto | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputContent, setInputContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // Viewport and auto-scroll control states
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [hasUnseenMessages, setHasUnseenMessages] = useState<boolean>(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef<boolean>(true);
  const prevMsgCountRef = useRef<number>(0);
  const isFirstLoadRef = useRef<boolean>(true);
  const currentConvIdRef = useRef<string | null>(null);

  const activeConvId = searchParams.get("conversationId");

  const scrollToBottom = (smooth = true) => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    isAtBottomRef.current = true;
    setIsAtBottom(true);
    setHasUnseenMessages(false);
  };

  const handleScroll = () => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom <= 80;

    isAtBottomRef.current = nearBottom;
    setIsAtBottom(nearBottom);

    if (nearBottom) {
      setHasUnseenMessages(false);
    }
  };

  const fetchConversations = async (showLoading = false) => {
    try {
      if (showLoading) setLoadingConvs(true);
      const res = await messageApi.getConversations();
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load messages.");
    } finally {
      if (showLoading) setLoadingConvs(false);
    }
  };

  const fetchActiveConversationDetails = async (convId: string, showLoading = false) => {
    try {
      if (showLoading) setLoadingMsgs(true);
      const res = await messageApi.getConversation(convId);
      if (res.data.success) {
        setActiveConv(res.data.data);
        const newMsgs = res.data.data.messages || [];
        setMessages((prevMsgs) => {
          if (
            prevMsgs.length === newMsgs.length &&
            prevMsgs.every((m, idx) => m.id === newMsgs[idx]?.id && m.isRead === newMsgs[idx]?.isRead)
          ) {
            return prevMsgs;
          }
          return newMsgs;
        });
        // Mark as read
        messageApi.markRead(convId).catch(() => {});
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load conversation details.");
    } finally {
      if (showLoading) setLoadingMsgs(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations(true);
  }, []);

  // Track conversation switches
  useEffect(() => {
    if (activeConvId !== currentConvIdRef.current) {
      currentConvIdRef.current = activeConvId;
      isFirstLoadRef.current = true;
      prevMsgCountRef.current = 0;
      isAtBottomRef.current = true;
      setIsAtBottom(true);
      setHasUnseenMessages(false);
    }
  }, [activeConvId]);

  // Sync selected conversation when query param changes or conversations load
  useEffect(() => {
    if (activeConvId) {
      fetchActiveConversationDetails(activeConvId, true);
    } else if (conversations.length > 0 && !activeConv) {
      // Automatically select first conversation on desktop
      setSearchParams({ conversationId: conversations[0].id }, { replace: true });
    }
  }, [activeConvId, conversations.length]);

  // Polling every 6 seconds (STRICTLY PRESERVED)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(false);
      if (activeConvId) {
        fetchActiveConversationDetails(activeConvId, false);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [activeConvId]);

  // Smart auto-scroll and position preservation
  useEffect(() => {
    if (!activeConv || messages.length === 0) {
      prevMsgCountRef.current = messages.length;
      return;
    }

    const prevCount = prevMsgCountRef.current;
    const currentCount = messages.length;

    if (isFirstLoadRef.current || prevCount === 0) {
      isFirstLoadRef.current = false;
      prevMsgCountRef.current = currentCount;
      // When conversation opens: automatically show latest message
      requestAnimationFrame(() => {
        scrollToBottom(false);
      });
      return;
    }

    if (currentCount > prevCount) {
      if (isAtBottomRef.current) {
        // User is already near bottom: smoothly auto-scroll to latest message
        requestAnimationFrame(() => {
          scrollToBottom(true);
        });
        setHasUnseenMessages(false);
      } else {
        // User has manually scrolled upward: DO NOT force them to bottom.
        // Preserve their current reading position and indicate new message.
        setHasUnseenMessages(true);
      }
    }

    prevMsgCountRef.current = currentCount;
  }, [messages, activeConv]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() || !activeConvId || sending) return;

    const content = inputContent.trim();
    setInputContent("");
    setSending(true);

    try {
      const res = await messageApi.sendMessage(activeConvId, content);
      if (res.data.success) {
        // When user sends a message, immediately scroll to newest message
        isAtBottomRef.current = true;
        setIsAtBottom(true);
        setHasUnseenMessages(false);
        setMessages((prev) => [...prev, res.data.data]);
        requestAnimationFrame(() => {
          scrollToBottom(true);
        });
        fetchConversations(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const name = user?.role === "student" ? c.employer?.workshopName : c.student?.name;
    const jobTitle = c.job?.title;
    const term = searchTerm.toLowerCase();
    return (name?.toLowerCase().includes(term) || jobTitle?.toLowerCase().includes(term));
  });

  const getOtherParticipantName = (c: ConversationDto) => {
    if (user?.role === "student") {
      return c.employer?.workshopName || "Employer Workshop";
    }
    return c.student?.name || "Candidate Applicant";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-base-bg text-slate-900 dark:text-ink-primary pb-6 sm:pb-8 selection:bg-blue-600 selection:text-white relative">
      {/* Soft atmospheric background blur */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <AppNavbar />

        <main className="content-wrap pt-4 sm:pt-6 max-w-7xl w-full mx-auto px-4 sm:px-6 flex-1 flex flex-col">
          <PageHeader
            title="Direct Messaging"
            subtitle="Communicate directly with workshop employers and ITI job applicants"
            onBack={() => navigate(user?.role === "employer" ? "/employer/dashboard" : "/student/dashboard")}
            backLabel="Back to Dashboard"
            badge={
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-blue-50 text-blue-600 border border-blue-200">
                {conversations.length} Active Conversations
              </span>
            }
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center justify-between shadow-xs shrink-0"
            >
              <span className="flex items-center gap-2">
                <AlertCircle size={15} /> {error}
              </span>
              <button onClick={() => fetchConversations(true)} className="underline font-bold flex items-center gap-1.5 hover:text-red-500 cursor-pointer">
                <RefreshCw size={13} /> Retry
              </button>
            </motion.div>
          )}

          {/* Chat Panel - Clean White Theme, Fixed viewport height */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-[calc(100dvh-175px)] md:h-[calc(100dvh-200px)] min-h-[500px] md:min-h-[550px] max-h-[820px] flex flex-col md:flex-row">
            
            {/* LEFT SIDEBAR - CONVERSATION LIST */}
            <div
              className={`w-full md:w-80 lg:w-96 border-r border-slate-200 bg-slate-50/70 flex flex-col h-full min-h-0 overflow-hidden ${
                activeConvId ? "hidden md:flex" : "flex"
              }`}
            >
              {/* Search Header */}
              <div className="p-3.5 border-b border-slate-200 bg-white shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search candidate, workshop or job..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
                {loadingConvs ? (
                  <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Loading conversations...</span>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-9 h-9 text-slate-300 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-slate-700">No conversations found</p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Conversations are created when you apply for a job or initiate chat with a candidate.
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isSelected = conv.id === activeConvId;
                    const name = getOtherParticipantName(conv);
                    const lastMsg = conv.latestMessage;
                    const unread = (conv.unreadCount || 0) > 0;

                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSearchParams({ conversationId: conv.id })}
                        className={`w-full text-left p-4 transition-all flex items-start gap-3.5 relative border-l-4 cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/90 border-l-blue-600"
                            : "border-l-transparent hover:bg-slate-50 bg-white"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/15 to-indigo-600/15 text-blue-600 font-bold flex items-center justify-center text-sm shrink-0 border border-blue-500/20 shadow-xs">
                          {name.charAt(0).toUpperCase()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className={`text-xs truncate ${unread ? "font-extrabold text-slate-900" : "font-semibold text-slate-800"}`}>
                              {name}
                            </h4>
                            {lastMsg && (
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>

                          {/* Job Badge */}
                          <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-medium mb-1 truncate">
                            <Briefcase className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="truncate">{conv.job?.title}</span>
                          </div>

                          {/* Message preview */}
                          <p className={`text-xs truncate ${unread ? "font-bold text-slate-900" : "text-slate-500"}`}>
                            {lastMsg ? lastMsg.content : <span className="italic text-slate-400">No messages yet</span>}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {unread && (
                          <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0 mt-1.5 animate-pulse" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT MAIN PANEL - MESSAGING CHAT AREA */}
            <div className={`flex-1 flex flex-col h-full min-h-0 bg-white ${!activeConvId ? "hidden md:flex" : "flex"}`}>
              {activeConv ? (
                <>
                  {/* Chat Header - Pinned at top, never scrolls away */}
                  <div className="shrink-0 p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10 shadow-xs">
                    <div className="flex items-center gap-3.5">
                      {/* Mobile Back Button */}
                      <button
                        onClick={() => setSearchParams({})}
                        className="md:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                        aria-label="Back to conversations list"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-blue-600/20 shadow-sm shrink-0">
                        {getOtherParticipantName(activeConv).charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {getOtherParticipantName(activeConv)}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{activeConv.job?.title}</span>
                          <span>•</span>
                          <span>{activeConv.job?.location}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message Viewport Container */}
                  <div className="relative flex-1 min-h-0 flex flex-col">
                    {/* Scrollable Message Viewport - Crisp Light Background, No Dimming Veil */}
                    <div
                      ref={viewportRef}
                      onScroll={handleScroll}
                      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-3.5 bg-[#F8FAFC] overscroll-contain"
                    >
                      {loadingMsgs ? (
                        <div className="text-center py-16 text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span>Loading message history...</span>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200 flex items-center justify-center mx-auto mb-3">
                            <MessageSquare className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800">Start the Conversation</h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                            Send a direct message regarding the candidate application for <span className="font-semibold text-slate-700">{activeConv.job?.title}</span>.
                          </p>
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const currentUserId =
                            user?.id ||
                            (user as any)?.userId ||
                            (user?.role === "student" ? activeConv?.student?.userId : activeConv?.employer?.userId);
                          
                          const isMe = Boolean(currentUserId && msg.senderId === currentUserId);
                          const msgTime = new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.18 }}
                              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                            >
                              <div
                                className={`max-w-[85%] sm:max-w-[72%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                                  isMe
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs"
                                    : "bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-xs"
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              </div>

                              <div
                                className={`flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 px-1 font-medium ${
                                  isMe ? "justify-end" : "justify-start"
                                }`}
                              >
                                <span>{msgTime}</span>
                                {isMe && (
                                  <span>
                                    {msg.isRead ? (
                                      <CheckCheck className="w-3.5 h-3.5 text-blue-600 inline" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5 text-slate-400 inline" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Compact Jump-to-Latest Floating Control */}
                    <AnimatePresence>
                      {!isAtBottom && (
                        <motion.button
                          type="button"
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => scrollToBottom(true)}
                          aria-label="Jump to latest message"
                          className={`absolute bottom-3 right-4 sm:right-6 z-20 flex items-center justify-center gap-1.5 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                            hasUnseenMessages
                              ? "px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-blue-600/30 border border-blue-400/30"
                              : "w-9 h-9 rounded-full bg-white text-blue-600 border border-slate-200 hover:bg-slate-50 shadow-slate-900/10"
                          }`}
                        >
                          {hasUnseenMessages ? (
                            <>
                              <span className="text-[11px] font-semibold tracking-wide">New messages</span>
                              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                            </>
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          )}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Composer Footer - Pinned to bottom, 44x44 action button */}
                  <form
                    onSubmit={handleSendMessage}
                    className="shrink-0 p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2.5 z-10"
                  >
                    <input
                      type="text"
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      placeholder="Write a message..."
                      disabled={sending}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 h-11 px-4 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!inputContent.trim() || sending}
                      aria-label="Send message"
                      title="Send message"
                      className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                        inputContent.trim() && !sending
                          ? "bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/35 hover:shadow-lg hover:shadow-blue-600/45 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.96] active:translate-y-0 cursor-pointer border border-blue-500/30"
                          : "bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed shadow-none"
                      }`}
                    >
                      {sending ? (
                        <Loader2 className="w-[18px] h-[18px] animate-spin text-white" />
                      ) : (
                        <Send
                          className={`w-[18px] h-[18px] -translate-y-px translate-x-px transition-colors duration-150 ${
                            inputContent.trim() && !sending ? "text-white" : "text-slate-400"
                          }`}
                        />
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mb-3">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Select a conversation</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                    Choose a candidate or job application conversation from the left panel to inspect messages.
                  </p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;

