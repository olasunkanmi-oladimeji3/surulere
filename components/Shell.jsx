"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABEL, displayName } from "@/lib/data";
import Seal from "./Seal";
import Icon from "./Icon";
import ChangePasswordModal from "./ChangePasswordModal";

function initials(name) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

/** Each role's sidebar destinations. Add a route here and it shows up in
 *  the sidebar automatically — no per-page wiring needed. */
const NAV_ITEMS = {
  owner: [
    { href: "/dashboard/owner", label: "My properties", icon: "building" },
  ],
  resident: [
    { href: "/dashboard/resident", label: "My profile", icon: "doorOpen" },
    { href: "/dashboard/resident/household", label: "My household", icon: "users" },
  ],
  cda: [
    { href: "/dashboard/cda", label: "My ward", icon: "shield" },
    { href: "/dashboard/cda/register-property", label: "Register a property", icon: "plus" },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: "building" },
    { href: "/dashboard/admin/properties", label: "Properties", icon: "house" },
     { href: "/dashboard/admin/residents", label: "Residents", icon: "doorOpen" },
    { href: "/dashboard/admin/field-submissions", label: "Field submissions", icon: "flag" },
    { href: "/dashboard/admin/cda-members", label: "CDA members", icon: "shield" },
    { href: "/dashboard/admin/lg-staff", label: "LG Staff", icon: "users" },
    { href: "/dashboard/admin/audit-log", label: "Audit log", icon: "search" },
  ],
};

export default function Shell({ user, children }) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const navItems = NAV_ITEMS[user.role] || [];

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="relative bg-ink text-on-ink lg:w-64 lg:min-h-screen lg:fixed lg:inset-y-0 flex flex-col overflow-hidden">
        <div className="ward-watermark absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true" />
        <div className="relative flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <span className="text-brass"><Image src="/logo.png" alt="Ilé Surulere" width={36} height={36} /></span>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold">Ilé Surulere</p>
            <p className="text-[11px] text-on-ink/60">Community Registry</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`side-link ${pathname === item.href ? "side-link-active" : ""}`}
            >
              <Icon name={item.icon} /> {item.label}
            </Link>
          ))}
          <Link href="/" className="side-link">
            <Icon name="house" /> Public site
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-white/10 ring-1 ring-brass/60 flex items-center justify-center text-xs font-semibold text-brass">
              {initials(displayName(user))}
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-sm font-medium truncate">{displayName(user)}</p>
              <p className="text-[11px] text-on-ink/60">{ROLE_LABEL[user.role]}</p>
            </div>
          </div>
          <button onClick={() => setPasswordModalOpen(true)} className="side-link w-full mt-1">
            <Icon name="key" /> Change password
          </button>
          <button onClick={handleLogout} className="side-link w-full">
            <Icon name="logout" /> Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64">
        <header className="bg-surface border-b border-line px-5 py-4 flex items-center justify-between gap-3 lg:hidden">
          <div className="flex items-center gap-2 text-ink">
            <span className="text-brass"><Image src="/logo.png" alt="Ilé Surulere" width={32} height={32} /></span>
            <span className="font-display text-sm font-semibold">Ilé Surulere</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPasswordModalOpen(true)} className="btn-ghost text-xs px-2.5 py-1.5">
              <Icon name="key" className="h-3.5 w-3.5" /> Password
            </button>
            <button onClick={handleLogout} className="btn-ghost text-xs px-2.5 py-1.5">
              <Icon name="logout" className="h-3.5 w-3.5" /> Log out
            </button>
          </div>
        </header>
        {/* Mobile-only sub-nav, since the sidebar with these links is hidden below lg */}
        {navItems.length > 1 && (
          <nav className="flex gap-1 px-5 pt-3 lg:hidden overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-medium px-3 py-1.5 rounded-[var(--radius-pill)] shrink-0 ${pathname === item.href ? "bg-ink text-on-ink" : "bg-paper text-muted"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        <main className="p-5 lg:p-8 max-w-6xl">{children}</main>
      </div>

      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </div>
  );
}