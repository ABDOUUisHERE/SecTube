import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaPaperPlane, FaArrowLeft, FaCommentAlt } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../store/authStore';
import useMessageStore from '../store/messageStore';
import useToastStore from '../store/toastStore';
import { useSocket } from '../hooks/useSocket';
import { messageAPI } from '../services/api';
import { getAvatarUrl } from '../config/constants';
import sanitize from '../utils/sanitize';

const Messages = () => {
  const { user } = useAuthStore();
  const { setUnreadCount } = useMessageStore();
  const { addToast } = useToastStore();
  const { sendMessage, setOnMessage } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeUserId, setActiveUserId] = useState(searchParams.get('with') || null);
  const [activeUser, setActiveUser] = useState(null);
  const [thread, setThread] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const isInitialLoad = useRef(true);

  const loadConversations = useCallback(async () => {
    try {
      const res = await messageAPI.getConversations();
      setConversations(res.data.data || []);
    } catch {
      // silently fail
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!activeUserId) return;
    isInitialLoad.current = true; // reset so next thread load scrolls instantly
    const conv = conversations.find((c) => String(c.otherUser?._id) === String(activeUserId));
    if (conv) setActiveUser(conv.otherUser);
  }, [activeUserId, conversations]);

  useEffect(() => {
    if (!activeUserId) return;
    setLoadingThread(true);
    setThread([]);

    messageAPI.getThread(activeUserId)
      .then((res) => {
        setThread(res.data.data || []);
        return messageAPI.markRead(activeUserId);
      })
      .then(() => {
        loadConversations();
        return messageAPI.getUnreadCount();
      })
      .then((r) => setUnreadCount(r.data.data))
      .catch(() => {})
      .finally(() => setLoadingThread(false));
  }, [activeUserId]);

  const scrollToBottom = (smooth = false) => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = messagesContainerRef.current;
      if (!el) return;
      if (smooth) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      } else {
        el.scrollTop = el.scrollHeight;
      }
    }));
  };

  // Scroll instantly when initial load finishes (loadingThread → false)
  useEffect(() => {
    if (!loadingThread && thread.length > 0) {
      scrollToBottom(false);
    }
  }, [loadingThread]);

  // Smooth scroll when a new real-time message arrives (thread grows after load)
  const prevThreadLen = useRef(0);
  useEffect(() => {
    if (loadingThread) { prevThreadLen.current = thread.length; return; }
    if (thread.length > prevThreadLen.current) {
      scrollToBottom(true);
    }
    prevThreadLen.current = thread.length;
  }, [thread]);

  useEffect(() => {
    setOnMessage((message) => {
      const senderId   = message.sender?._id  || message.sender;
      const receiverId = message.receiver?._id || message.receiver;

      if (String(senderId) === String(activeUserId) || String(receiverId) === String(activeUserId)) {
        setThread((prev) => [...prev, message]);
        // Mark as read immediately since this thread is open, then sync counts
        messageAPI.markRead(activeUserId)
          .then(() => messageAPI.getUnreadCount())
          .then((r) => setUnreadCount(r.data.data))
          .catch(() => {});
      }

      loadConversations();
    });

    return () => setOnMessage(null); // clean up on unmount / activeUserId change
  }, [activeUserId, setOnMessage, loadConversations]);

  const openConversation = (conv) => {
    const otherId = String(conv.otherUser?._id);
    setActiveUserId(otherId);
    setActiveUser(conv.otherUser);
    setSearchParams({ with: otherId });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeUserId || sending) return;

    const content = input.trim();
    setInput('');
    setSending(true);

    const optimistic = {
      _id: `tmp-${Date.now()}`,
      sender:   { _id: user._id, username: user.username, avatar: user.avatar },
      receiver: { _id: activeUserId },
      content,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setThread((prev) => [...prev, optimistic]);

    sendMessage(activeUserId, content, (ack) => {
      setSending(false);
      if (ack?.success) {
        setThread((prev) => prev.map((m) => (m._id === optimistic._id ? ack.data : m)));
        loadConversations();
      } else {
        setThread((prev) => prev.filter((m) => m._id !== optimistic._id));
        addToast({ type: 'error', message: ack?.message || 'Failed to send message. Please try again.' });
      }
    });
  };

  const myId = String(user?._id || user?.id);

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-dark-950">

      {/* ── Conversation list ──────────────────────────────────── */}
      <div className={`flex-shrink-0 w-full md:w-72 lg:w-80 border-r border-dark-800 flex flex-col bg-dark-900 ${activeUserId ? 'hidden md:flex' : 'flex'}`}>

        <div className="px-4 py-4 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <FaCommentAlt className="text-primary-500" size={14} />
            <h1 className="text-sm font-bold text-white">Messages</h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Your private conversations</p>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loadingConvs ? (
            <div className="py-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] animate-shimmer flex-shrink-0 border border-dark-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] animate-shimmer rounded w-1/2" />
                    <div className="h-2.5 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 bg-[length:200%_100%] animate-shimmer rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
              <FaCommentAlt className="text-gray-700 mb-3" size={32} />
              <p className="text-sm font-medium text-gray-500 mb-1">No conversations yet</p>
              <p className="text-xs text-gray-600">Visit a channel page and send someone a message.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other    = conv.otherUser;
              const isActive = String(other?._id) === String(activeUserId);
              return (
                <button
                  key={other?._id}
                  onClick={() => openConversation(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left border-l-2 ${
                    isActive
                      ? 'bg-dark-800 border-primary-500'
                      : 'border-transparent hover:bg-dark-800/60 hover:border-dark-700'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={getAvatarUrl(other?.avatar)}
                      alt={other?.displayName || other?.username}
                      className={`w-10 h-10 rounded-full object-cover border ${isActive ? 'border-primary-500/40' : 'border-dark-700'}`}
                      onError={(e) => { e.target.src = getAvatarUrl(); }}
                    />
                    {conv.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                        {conv.unread > 9 ? '9+' : conv.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-primary-400' : 'text-white'}`}>
                        {other?.displayName || other?.username}
                      </p>
                      <span className="text-[10px] text-gray-600 whitespace-nowrap flex-shrink-0">
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${conv.unread > 0 ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                      {String(conv.lastMessage.sender) === myId || String(conv.lastMessage.sender?._id) === myId
                        ? `You: ${conv.lastMessage.content}`
                        : conv.lastMessage.content}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Thread panel ───────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 ${!activeUserId ? 'hidden md:flex' : 'flex'}`}>
        {!activeUserId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary-500/10 rounded-3xl blur-2xl" />
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700">
                <FaCommentAlt className="text-primary-500" size={26} />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Select a conversation</p>
            <p className="text-xs text-gray-600 max-w-xs">Choose someone from the list to start messaging.</p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-800 bg-dark-900 flex-shrink-0">
              <button
                onClick={() => { setActiveUserId(null); setSearchParams({}); }}
                className="md:hidden p-1.5 text-gray-500 hover:text-white transition rounded-md hover:bg-dark-800"
              >
                <FaArrowLeft size={13} />
              </button>
              {activeUser && (
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <img
                    src={getAvatarUrl(activeUser.avatar)}
                    alt={activeUser.displayName || activeUser.username}
                    className="w-8 h-8 rounded-full object-cover border border-dark-700 flex-shrink-0"
                    onError={(e) => { e.target.src = getAvatarUrl(); }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white leading-tight truncate">
                      {activeUser.displayName || activeUser.username}
                    </p>
                    <p className="text-[11px] text-gray-500">@{activeUser.username}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin">
              {loadingThread ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : thread.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-1">
                  <FaCommentAlt className="text-gray-700 mb-2" size={28} />
                  <p className="text-sm font-medium text-gray-500">No messages yet</p>
                  <p className="text-xs text-gray-600">Be the first to say something!</p>
                </div>
              ) : (
                thread.map((msg) => {
                  const isMine = String(msg.sender?._id || msg.sender) === myId;
                  return (
                    <div key={msg._id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {!isMine && (
                        <img
                          src={getAvatarUrl(msg.sender?.avatar)}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover border border-dark-700 flex-shrink-0"
                          onError={(e) => { e.target.src = getAvatarUrl(); }}
                        />
                      )}
                      <div className={`max-w-[68%] flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`px-3 py-2 rounded-md text-sm leading-relaxed break-words border ${
                          isMine
                            ? `bg-primary-600 border-primary-700 text-white ${msg._optimistic ? 'opacity-60' : ''}`
                            : 'bg-dark-800 border-dark-700 text-gray-100'
                        }`}>
                          {sanitize(msg.content)}
                        </div>
                        <span className="text-[10px] text-gray-600 px-1">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex items-end gap-0 px-4 py-3 border-t border-dark-800 bg-dark-900 flex-shrink-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                }}
                placeholder="Write a message..."
                rows={1}
                className="flex-1 bg-dark-950 border border-dark-700 hover:border-dark-600 rounded-l-md px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none transition-colors max-h-28 overflow-y-auto"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="bg-dark-800 hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed border border-l-0 border-dark-700 hover:border-dark-600 rounded-r-md px-4 py-2 h-full transition-colors flex items-center justify-center"
              >
                <FaPaperPlane
                  size={14}
                  className={input.trim() ? 'text-primary-400' : 'text-gray-600'}
                />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
