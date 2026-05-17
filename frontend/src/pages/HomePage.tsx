import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  MapPin,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../store";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";

const CATEGORIES = [
  "All",
  "Beach",
  "Mountains",
  "City",
  "Culture",
  "Adventure",
  "Budget",
  "Luxury",
];

const MOCK_DESTINATIONS = [
  {
    id: "1",
    name: "Santorini",
    country: "Greece",
    emoji: "🏝️",
    tag: "Beach",
    rating: 4.9,
    price: 890,
    color: "#1a6b5a",
  },
  {
    id: "2",
    name: "Kyoto",
    country: "Japan",
    emoji: "⛩️",
    tag: "Culture",
    rating: 4.8,
    price: 1200,
    color: "#c17d3a",
  },
  {
    id: "3",
    name: "Banff",
    country: "Canada",
    emoji: "🏔️",
    tag: "Mountains",
    rating: 4.9,
    price: 750,
    color: "#1a4d7a",
  },
  {
    id: "4",
    name: "Amalfi",
    country: "Italy",
    emoji: "🌊",
    tag: "Luxury",
    rating: 4.8,
    price: 1650,
    color: "#7a4d8a",
  },
  {
    id: "5",
    name: "Tbilisi",
    country: "Georgia",
    emoji: "🇬🇪",
    tag: "City",
    rating: 4.6,
    price: 420,
    color: "#c17d3a",
  },
  {
    id: "6",
    name: "Machu Picchu",
    country: "Peru",
    emoji: "🏛️",
    tag: "Adventure",
    rating: 4.7,
    price: 980,
    color: "#1a6b5a",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: trips = [] } = useQuery({
    queryKey: ["trips"],
    queryFn: () => api.get("/trips").then((r) => r.data),
  });

  const stats = [
    {
      label: "Active trips",
      value: trips.length || 0,
      icon: Calendar,
      color: "bg-brand-50 text-brand-500",
    },
    {
      label: "Total budget",
      value: `$${trips.reduce((s: number, t: { totalBudget: number }) => s + t.totalBudget, 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Collaborators",
      value: trips.reduce(
        (s: number, t: { members?: { id: string }[] }) =>
          s + (t.members?.length || 0),
        0,
      ),
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Trending now",
      value: "24",
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden h-64 bg-gradient-to-br from-gray-900 via-brand-900 to-teal-900 flex items-center"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10 px-8">
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-white/70 mb-6">Where are you headed next?</p>
          <button
            onClick={() => navigate("/trips")}
            className="btn-primary bg-white text-gray-900 hover:bg-gray-100"
          >
            <Plus size={16} /> Plan New Trip
          </button>
        </div>

        {/* Floating badges */}
        {[
          {
            text: "Paris, France",
            sub: "2h 45m flight",
            emoji: "✈️",
            pos: "top-6 right-12",
          },
          {
            text: "24°C",
            sub: "Perfect weather",
            emoji: "🌡️",
            pos: "top-16 right-64",
          },
        ].map((b, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 1.5 }}
            className={`absolute ${b.pos} bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-3 py-2 flex items-center gap-2 hidden lg:flex`}
          >
            <span className="text-lg">{b.emoji}</span>
            <div>
              <p className="text-white text-xs font-semibold">{b.text}</p>
              <p className="text-white/60 text-xs">{b.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
              >
                <Icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Trending Destinations</h2>
          <button
            onClick={() => navigate("/map")}
            className="text-brand-500 text-sm font-medium flex items-center gap-1 hover:underline"
          >
            View on map <ArrowRight size={14} />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mb-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className="px-4 py-1.5 rounded-full text-sm border border-gray-200 dark:border-gray-700 hover:border-brand-500 hover:text-brand-500 transition-all first:bg-brand-500 first:text-white first:border-brand-500"
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_DESTINATIONS.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 cursor-pointer group"
              onClick={() => navigate("/map")}
            >
              <div
                className="h-44 flex items-center justify-center text-6xl relative"
                style={{
                  background: `linear-gradient(135deg, ${dest.color}cc, ${dest.color}44, #1a3d5c)`,
                }}
              >
                {dest.emoji}
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-xs font-semibold text-brand-500">
                  {dest.tag}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{dest.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {dest.country}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-500 font-bold text-sm">
                      From ${dest.price}
                    </p>
                    <p className="text-xs text-yellow-500">⭐ {dest.rating}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* My Trips */}
      {trips.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">My Trips</h2>
            <button
              onClick={() => navigate("/trips")}
              className="text-brand-500 text-sm font-medium flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.slice(0, 3).map((trip: any) => (
              <motion.div
                key={trip.id}
                whileHover={{ y: -2 }}
                className="card cursor-pointer border-l-4 border-l-brand-500"
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                <h3 className="font-semibold mb-1">{trip.name}</h3>
                <p className="text-xs text-gray-500 mb-3">
                  {trip.startDate
                    ? new Date(trip.startDate).toLocaleDateString()
                    : "No date set"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {trip.members?.slice(0, 3).map((m: any) => (
                      <div
                        key={m.id}
                        className="w-6 h-6 rounded-full bg-brand-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      >
                        {m.user.name.slice(0, 1)}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    ${trip.totalBudget.toLocaleString()} budget
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
