"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getVendorConfig } from "@/lib/vendors";

type ItemDoc = {
  id: string;
  name: string;
  vendor?: string;
};

export default function RestockPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<ItemDoc[]>([]);

  useEffect(() => {
    let unsubItems: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      unsubItems = onSnapshot(
        collection(db, "users", currentUser.uid, "items"),
        (snap) => {
          const data = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          })) as ItemDoc[];

          setItems(data);
        }
      );
    });

    return () => {
      unsubAuth();
      unsubItems?.();
    };
  }, [router]);

  return (
    <motion.main
      className="p-10 flex-1 max-w-5xl mx-auto"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        Restock
      </h1>

      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Quickly reorder items from your vendors.
      </p>

      {items.length === 0 && (
        <div className="mt-10 p-10 border border-dashed rounded-xl text-center text-slate-500 dark:text-slate-400">
          No items available to restock.
        </div>
      )}

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {item.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Vendor: {item.vendor || "Unknown"}
              </p>
            </div>

            <a
              href={getVendorConfig(item.vendor).buildUrl(item.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-sm"
            >
              Reorder
            </a>
          </div>
        ))}
      </div>
    </motion.main>
  );
}