import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  UserPlus,
  X,
  Heart,
  ThumbsUp,
  Laugh,
  Flame,
  CheckCircle,
  PartyPopper,
} from "lucide-react";
import { useAuthStore } from "../store";
import {
  useComments,
  useMembers,
  usePostComment,
  useReactToComment,
  useInviteMember,
} from "../hooks/useCollab";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Comment } from "../types";

const REACTIONS = [
  { icon: Heart, label: "love" },
  { icon: ThumbsUp, label: "like" },
  { icon: Laugh, label: "haha" },
  { icon: Flame, label: "fire" },
  { icon: CheckCircle, label: "done" },
  { icon: PartyPopper, label: "celebrate" },
];

export default function CollabPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user, accessToken } = useAuthStore();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<
    { id: string; name: string }[]
  >([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: comments = [] } = useComments(tripId!);
  const { data: members = [] } = useMembers(tripId!);
  const postComment = usePostComment(tripId!);
  const reactToComment = useReactToComment(tripId!);
  const inviteMember = useInviteMember(tripId!);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  useEffect(() => {
    if (!accessToken || !tripId) return;
    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:4000",
      { auth: { token: accessToken } },
    );
    socket.emit("trip:join", { tripId });
    socket.on("comment:new", () =>
      qc.invalidateQueries({ queryKey: ["comments", tripId] }),
    );
    socket.on("trip:online_users", (users) =>
      setOnlineUsers(users.map((u: { id: string; name: string }) => u)),
    );
    socket.on("trip:member_joined", (data) => {
      setOnlineUsers((p) => [...p, data.user]);
      toast(`${data.user.name} joined!`);
    });
    return () => {
      socket.emit("trip:leave", { tripId });
      socket.disconnect();
    };
  }, [accessToken, tripId]);

  const handleSend = () => {
    if (!text.trim()) return;
    postComment.mutate(text, { onSuccess: () => setText("") });
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    inviteMember.mutate(inviteEmail, {
      onSuccess: () => {
        toast.success("Invite sent!");
        setInviteEmail("");
        setShowInvite(false);
      },
      onError: () => toast.error("Failed to send invite"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Collaborate</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time trip planning with your team
          </p>
        </div>
        <button onClick={() => setShowInvite(true)} className="btn-primary">
          <UserPlus size={16} /> Invite
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className="lg:col-span-2 card flex flex-col"
          style={{ height: "65vh" }}
        >
          <h3 className="font-semibold mb-4">Comments</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {comments.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-12">
                No comments yet
              </p>
            )}
            {comments.map((comment: Comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-brand-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {comment.author.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div
                    style={{
                      background:
                        comment.author.id === user?.id ? "#c17d3a" : "#f3f4f6",
                      color:
                        comment.author.id === user?.id ? "white" : "#111827",
                      borderRadius: "16px",
                      padding: "10px 16px",
                      fontSize: "14px",
                      maxWidth: "320px",
                    }}
                  >
                    {comment.text}
                  </div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {REACTIONS.map(({ icon: Icon, label }) => {
                      const count =
                        comment.reactions?.filter((r) => r.emoji === label)
                          .length || 0;
                      const reacted = comment.reactions?.some(
                        (r) => r.emoji === label && r.userId === user?.id,
                      );
                      return (
                        <button
                          key={label}
                          onClick={() =>
                            reactToComment.mutate({
                              commentId: comment.id,
                              emoji: label,
                            })
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            padding: "3px 8px",
                            borderRadius: "20px",
                            border: `1.5px solid ${reacted ? "#c17d3a" : "#e5e7eb"}`,
                            background: reacted ? "#fdf8f0" : "transparent",
                            cursor: "pointer",
                            fontSize: "12px",
                            color: reacted ? "#c17d3a" : "#6b7280",
                            transition: "all 0.15s",
                          }}
                        >
                          <Icon size={11} fill={reacted ? "#c17d3a" : "none"} />
                          {count > 0 && count}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <input
              className="input flex-1 text-sm"
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="btn-primary px-3"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Team</h3>
            {onlineUsers.length > 0 && (
              <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
                {onlineUsers.length} online
              </span>
            )}
          </div>
          <div className="space-y-3">
            {members.map((m: { id: string; user: { name: string } }) => {
              const isOnline = onlineUsers.some((u) => u.id === m.user.id);
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-brand-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                      {m.user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-300"}`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{m.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {m.role} · {isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInvite && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl font-bold">
                  Invite Member
                </h2>
                <button
                  onClick={() => setShowInvite(false)}
                  className="btn-ghost p-1.5"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="label">Email address</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="friend@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <button
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#c17d3a",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  disabled={!inviteEmail || inviteMember.isPending}
                  onClick={handleInvite}
                >
                  {inviteMember.isPending ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
