"use client";

import { useEffect, useState } from "react";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [displayName, setDisplayName] = useState("");
  const [theme, setTheme] = useState("light");
  const [saving, setSaving] = useState(false);

  // -----------------------------
  // AUTH CHECK
  // -----------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) return router.push("/login");

      setUser(u);
      setDisplayName(u.displayName || "");
    });

    return () => unsub();
  }, [router]);

  // -----------------------------
  // SAVE PROFILE
  // -----------------------------
  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);

    try {
      await updateProfile(user, {
        displayName: displayName,
      });
    } catch (err) {
      console.error("Error updating profile:", err);
    }

    setSaving(false);
  }

  return (
    <motion.main
      className="flex-1 p-10"
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.h1
        className="text-3xl font-bold"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Settings
      </motion.h1>

      <p className="text-slate-600 mt-2">Manage your account & preferences.</p>

      {/* ============================ */}
      {/* ACCOUNT SETTINGS */}
      {/* ============================ */}
      <motion.div
        className="mt-10 bg-white p-6 rounded-xl shadow max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>

        <label className="block text-sm text-slate-600 mt-3">
          Display Name
        </label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-3 border rounded-lg mt-1"
          placeholder="Your name"
        />

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="mt-4 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <div className="mt-6 text-sm text-slate-500">
          <p>
            Want to change your password?  
            <a
              href="https://myaccount.google.com/security"
              className="text-sky-600 hover:underline ml-1"
              target="_blank"
            >
              Manage through your Google account
            </a>
          </p>
        </div>
      </motion.div>

      {/* ============================ */}
      {/* APP SETTINGS */}
      {/* ============================ */}
      <motion.div
        className="mt-10 bg-white p-6 rounded-xl shadow max-w-xl"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-4">App Preferences</h2>

        {/* LIGHT/DARK THEME SWITCH */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-slate-600">Dark Mode</span>

          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
              theme === "dark" ? "bg-sky-600" : "bg-slate-300"
            }`}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${
                theme === "dark" ? "translate-x-6" : ""
              }`}
            ></div>
          </div>
        </label>

        {/* Notifications Placeholder */}
        <label className="flex items-center justify-between cursor-pointer mt-6">
          <span className="text-sm text-slate-600">Email Notifications</span>

          <span className="text-slate-400 text-xs">
            (Coming Soon)
          </span>
        </label>
      </motion.div>
    </motion.main>
  );
}
