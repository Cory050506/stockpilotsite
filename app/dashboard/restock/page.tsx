"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PLANS } from "@/lib/plans";

type ItemDoc = {
  id: string;
  name: string;
  vendorId?: string;
};

type VendorDoc = {
  id: string;
  name: string;
  email?: string;
  website?: string;
};

export default function RestockPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<ItemDoc[]>([]);
  const [vendors, setVendors] = useState<Record<string, VendorDoc>>({});
  const [plan, setPlan] = useState<keyof typeof PLANS>("basic");
  const [showSavingsModal, setShowSavingsModal] = useState(false);

  const isProOrHigher =
    plan === "pro" || plan === "premium" || plan === "enterprise";

  // ----------------------------
  // AUTH + LOAD DATA
  // ----------------------------
  useEffect(() => {
    let unsubItems: (() => void) | undefined;
    let unsubVendors: (() => void) | undefined;
    let unsubUser: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Load org plan
      const userRef = doc(db, "users", currentUser.uid);
      unsubUser = onSnapshot(userRef, (snap) => {
        const orgId = snap.data()?.orgId;
        if (!orgId) return;

        onSnapshot(doc(db, "organizations", orgId), (orgSnap) => {
          const rawPlan = orgSnap.data()?.plan;
          setPlan(rawPlan && rawPlan in PLANS ? rawPlan : "basic");
        });
      });

      // Load vendors
      unsubVendors = onSnapshot(
        collection(db, "users", currentUser.uid, "vendors"),
        (snap) => {
          const map: Record<string, VendorDoc> = {};
          snap.docs.forEach((d) => {
            map[d.id] = { id: d.id, ...(d.data() as any) };
          });
          setVendors(map);
        }
      );

      // Load items
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
      unsubVendors?.();
      unsubUser?.();
    };
  }, [router]);

  // ----------------------------
  // HELPERS
  // ----------------------------
  function isInnerSpaceVendor(v?: VendorDoc) {
    if (!v?.name) return false;
    const n = v.name.toLowerCase();
    return n.includes("inner space") || n.includes("issi");
  }

  function buildInnerSpaceEmail(item: ItemDoc) {
    const subject = `Restock Request – ${item.name}`;
    const body = `Hello Inner Space Systems,

I would like to place a restock order for the following item:

Item: ${item.name}

This request was sent from the Restok app (getrestok.com).

Thank you,
${user?.displayName || "—"}`;

    return `mailto:sales@issioffice.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  function buildVendorEmail(vendor: VendorDoc, item: ItemDoc) {
    const subject = `Restock Request – ${item.name}`;
    const body = `Hello ${vendor.name},

I would like to place a restock order for:

Item: ${item.name}

Thank you,
${user?.displayName || "—"}`;

    return `mailto:${vendor.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <motion.main
      className="p-10 flex-1 max-w-5xl mx-auto"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold">Restock</h1>

      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Quickly reorder items from your saved vendors.
      </p>

      {/* PRO+ UPSELL */}
      {isProOrHigher && (
        <div className="mt-6 p-4 rounded-xl bg-sky-50 dark:bg-sky-900/30 border flex justify-between">
          <p className="text-sm">
            💡 Save money by switching to Inner Space Systems
          </p>
          <button
            onClick={() => setShowSavingsModal(true)}
            className="px-3 py-1.5 bg-sky-600 text-white rounded-md"
          >
            Learn more
          </button>
        </div>
      )}

      {items.length === 0 && (
        <div className="mt-10 p-10 border border-dashed rounded-xl text-center">
          No items available to restock.
        </div>
      )}

      <div className="mt-6 space-y-4">
        {items.map((item) => {
          const vendor = item.vendorId
            ? vendors[item.vendorId]
            : undefined;

          return (
            <div
              key={item.id}
              className="p-4 rounded-xl border bg-white dark:bg-slate-800 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-slate-500">
                  Vendor: {vendor?.name || "Not set"}
                </p>
              </div>

              {!vendor ? (
                <span className="text-xs italic text-slate-400">
                  No vendor linked
                </span>
              ) : isInnerSpaceVendor(vendor) ? (
                <a
                  href={buildInnerSpaceEmail(item)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md"
                >
                  Email Inner Space
                </a>
              ) : vendor.email ? (
                <a
                  href={buildVendorEmail(vendor, item)}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md"
                >
                  Email Vendor
                </a>
              ) : vendor.website ? (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-sky-600 text-white rounded-md"
                >
                  Visit Website
                </a>
              ) : (
                <span className="text-xs italic text-slate-400">
                  No contact info
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* SAVINGS MODAL */}
      {showSavingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl max-w-md">
            <h2 className="text-lg font-semibold">
              Save on Office Supplies
            </h2>

            <p className="text-sm mt-2">
              Switch your vendor to <strong>Inner Space Systems</strong> and
              email orders directly from Restok.
            </p>

            <a
              href="https://www.issioffice.com/office-supplies"
              target="_blank"
              className="block mt-4 text-center bg-sky-600 text-white py-2 rounded"
            >
              Visit Inner Space Systems's Website
            </a>

            <button
              onClick={() => setShowSavingsModal(false)}
              className="mt-3 w-full border py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.main>
  );
}