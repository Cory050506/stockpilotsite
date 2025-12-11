"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
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

export default function DashboardHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    runningLow: 0,
    dueToday: 0,
  });

  // AUTH CHECK
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  // FETCH ITEMS
  useEffect(() => {
    if (!user) return;

    const unsubItems = onSnapshot(
      collection(db, "users", user.uid, "items"),
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setItems(data);
        calculateStats(data);
      }
    );

    return () => unsubItems();
  }, [user]);

  // STATS CALCULATION
  function calculateStats(items: any[]) {
    const today = new Date();
    let runningLow = 0;
    let dueToday = 0;

    items.forEach((item) => {
      if (!item.createdAt) return;

      const created = item.createdAt.toDate();
      const emptyDate = new Date(created);
      emptyDate.setDate(emptyDate.getDate() + item.daysLast);

      const diffDays = Math.ceil(
        (emptyDate.getTime() - today.getTime()) / 86400000
      );

      if (diffDays <= 3) runningLow++;
      if (diffDays === 0) dueToday++;
    });

    setStats({
      totalItems: items.length,
      runningLow,
      dueToday,
    });
  }

  const graphData = items
    .map((item) => {
      if (!item.createdAt) return null;

      const created = item.createdAt.toDate();
      const now = new Date();
      const diff = Math.floor((now.getTime() - created.getTime()) / 86400000);
      const daysLeft = Math.max(item.daysLast - diff, 0);

      return {
        name: item.name,
        daysLeft,
      };
    })
    .filter(Boolean);

  return (
    <motion.div
      className="min-h-screen flex bg-slate-100"
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >

      {/* =============================== */}
      {/* SIDEBAR (same as Items page) */}
      {/* =============================== */}
      <aside className="w-64 bg-white border-r p-6 hidden md:flex flex-col">
        <motion.h1
          className="text-2xl font-bold mb-8"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          StockPilot
        </motion.h1>

        <nav className="flex flex-col gap-2">

          <motion.a
            href="/dashboard"
            className="flex items-center gap-3 p-2 rounded-lg bg-slate-100 font-semibold"
            whileHover={{ x: 4 }}
          >
            📊 Dashboard
          </motion.a>

          <motion.a
            href="/dashboard/items"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
            whileHover={{ x: 4 }}
          >
            📦 Items
          </motion.a>

          <motion.a
            href="/dashboard/settings"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100"
            whileHover={{ x: 4 }}
          >
            ⚙️ Settings
          </motion.a>

        </nav>

        <motion.button
          onClick={() => signOut(auth)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-auto bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
        >
          Log Out
        </motion.button>
      </aside>

      {/* =============================== */}
      {/* MAIN CONTENT */}
      {/* =============================== */}
      <main className="flex-1 p-10">

        <motion.h1
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Dashboard
        </motion.h1>

        <motion.p
          className="text-slate-600 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Welcome back, {user?.email}! Here's your supply overview:
        </motion.p>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <motion.div className="p-6 bg-white rounded-xl shadow">
            <h2 className="text-lg text-slate-600">Total Items</h2>
            <p className="text-4xl font-bold mt-2">{stats.totalItems}</p>
          </motion.div>

          <motion.div className="p-6 bg-white rounded-xl shadow">
            <h2 className="text-lg text-slate-600">Running Low (≤3 days)</h2>
            <p className="text-4xl font-bold mt-2 text-amber-600">
              {stats.runningLow}
            </p>
          </motion.div>

          <motion.div className="p-6 bg-white rounded-xl shadow">
            <h2 className="text-lg text-slate-600">Due Today</h2>
            <p className="text-4xl font-bold mt-2 text-red-600">
              {stats.dueToday}
            </p>
          </motion.div>
        </div>

        {/* GRAPH */}
        <motion.div
          className="mt-10 bg-white p-6 rounded-xl shadow"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4">Days Left Per Item</h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="daysLeft"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}
