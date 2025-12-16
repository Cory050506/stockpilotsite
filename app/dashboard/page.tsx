"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ItemDoc = {
  id: string;
  name: string;
  daysLast: number;
  createdAt?: any;
};

type Plan = "basic" | "pro" | "premium" | "enterprise";

export default function DashboardHome() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [items, setItems] = useState<ItemDoc[]>([]);
  const [attentionItems, setAttentionItems] = useState<ItemDoc[]>([]);
  const [showAttentionModal, setShowAttentionModal] = useState(false);
  const [plan, setPlan] = useState<Plan>("basic");

  const [stats, setStats] = useState({
    totalItems: 0,
    runningLow: 0,
    dueToday: 0,
  });

  // -------------------------
  // AUTH
  // -------------------------
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push("/login");

      setUser(u);

      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) setProfile(snap.data());
    });
  }, [router]);

  // -------------------------
  // PLAN
  // -------------------------
  useEffect(() => {
    if (!user) return;

    return onSnapshot(doc(db, "users", user.uid), (snap) => {
      const orgId = snap.data()?.orgId;
      if (!orgId) return;

      onSnapshot(doc(db, "organizations", orgId), (orgSnap) => {
        const p = orgSnap.data()?.plan;
        setPlan(
          p === "pro" || p === "premium" || p === "enterprise"
            ? p
            : "basic"
        );
      });
    });
  }, [user]);

  // -------------------------
  // ITEMS
  // -------------------------
  useEffect(() => {
    if (!user) return;

    return onSnapshot(
      collection(db, "users", user.uid, "items"),
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as ItemDoc[];

        setItems(data);
        calculateStats(data);
      }
    );
  }, [user]);

  // -------------------------
  // ATTENTION POPUP (FIXED)
  // -------------------------
  useEffect(() => {
    if (!user) return;
    if (!items.length) return;

    const isProOrHigher =
      plan === "pro" || plan === "premium" || plan === "enterprise";
    if (!isProOrHigher) return;

    const key = `restok_attention_dismissed_${user.uid}`;
    if (sessionStorage.getItem(key)) return;

    const needsAttentionItems = items.filter(needsAttention);
    if (needsAttentionItems.length === 0) return;

    setAttentionItems(needsAttentionItems);
    setShowAttentionModal(true);
  }, [items, plan, user]);

  // -------------------------
  // HELPERS
  // -------------------------
  function needsAttention(item: ItemDoc) {
    if (!item.createdAt) return false;

    const created = item.createdAt.toDate();
    const diffDays = Math.floor(
      (Date.now() - created.getTime()) / 86400000
    );

    return item.daysLast - diffDays <= 3;
  }

  function calculateStats(data: ItemDoc[]) {
    let runningLow = 0;
    let dueToday = 0;

    data.forEach((item) => {
      if (!item.createdAt) return;

      const created = item.createdAt.toDate();
      const emptyDate = new Date(created);
      emptyDate.setDate(emptyDate.getDate() + item.daysLast);

      const diffDays = Math.ceil(
        (emptyDate.getTime() - Date.now()) / 86400000
      );

      if (diffDays <= 3) runningLow++;
      if (diffDays === 0) dueToday++;
    });

    setStats({
      totalItems: data.length,
      runningLow,
      dueToday,
    });
  }

  const graphData = items
    .map((item) => {
      if (!item.createdAt) return null;
      const created = item.createdAt.toDate();
      const diff = Math.floor(
        (Date.now() - created.getTime()) / 86400000
      );
      return { name: item.name, daysLeft: Math.max(item.daysLast - diff, 0) };
    })
    .filter(Boolean);

  const displayName =
    profile?.name || user?.displayName || user?.email || "there";

  // -------------------------
  // UI
  // -------------------------
  return (
    <motion.main
      className="flex-1 p-10"
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Welcome back, {displayName}!
      </p>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        <Stat label="Total Items" value={stats.totalItems} />
        <Stat label="Running Low" value={stats.runningLow} color="amber" />
        <Stat label="Due Today" value={stats.dueToday} color="red" />
      </div>

      {/* GRAPH */}
      <div className="mt-10 bg-white dark:bg-slate-800 p-6 rounded-xl">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line dataKey="daysLeft" stroke="#0ea5e9" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ATTENTION MODAL */}
      {showAttentionModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-lg"
          >
            <h2 className="text-lg font-semibold">
              🔔 Take a look at these items
            </h2>

            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {attentionItems.map((i) => (
                <div key={i.id} className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                  {i.name}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  sessionStorage.setItem(
                    `restok_attention_dismissed_${user.uid}`,
                    "true"
                  );
                  setShowAttentionModal(false);
                }}
                className="w-1/2 border rounded py-2"
              >
                Later
              </button>

              <button
                onClick={() => {
                  sessionStorage.setItem(
                    `restok_attention_dismissed_${user.uid}`,
                    "true"
                  );
                  const ids = attentionItems.map(i => i.id).join(",");
                  router.push(`/dashboard/restock?review=${ids}`);
                }}
                className="w-1/2 bg-sky-600 text-white rounded py-2"
              >
                Review items
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.main>
  );
}

// Small stat card
function Stat({ label, value, color }: any) {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl">
      <h3 className="text-slate-500">{label}</h3>
      <p className={`text-4xl font-bold text-${color ?? "slate"}-500`}>
        {value}
      </p>
    </div>
  );
}