"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Profile = {
  name: string;
  email: string;
  phone: string;
  year: string;
  branch: string;
  photoDataUrl?: string;
};

const NAV = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Problems", href: "/dashboard/problems" },
  { label: "Contests", href: "/dashboard/contests" },
  { label: "Leaderboard", href: "/dashboard/leaderboard" },
  { label: "Badges", href: "/dashboard/badges" },
  { label: "Settings", href: "/dashboard/settings" },
];

const DEFAULT_PROFILE: Profile = {
  name: "Rameshwar Bhumbar",
  email: "rameshwar@example.com",
  phone: "",
  year: "Third Year",
  branch: "CSE",
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load profile from localStorage
  const loadProfile = () => {
    try {
      // First check if there's a current student session
      const currentStudentRaw = localStorage.getItem("codepvg_current_student");
      if (currentStudentRaw) {
        const currentStudent = JSON.parse(currentStudentRaw);
        const profileFromStudent = {
          name: currentStudent.name,
          email: currentStudent.email,
          phone: '',
          year: currentStudent.year,
          branch: currentStudent.branch,
          photoDataUrl: currentStudent.photoDataUrl || null
        };
        setProfile({ ...DEFAULT_PROFILE, ...profileFromStudent });
        return;
      }
      
      // Fallback to profile storage
      const raw = localStorage.getItem("codepvg_profile");
      if (raw) {
        const parsed = JSON.parse(raw) as Profile;
        setProfile({ ...DEFAULT_PROFILE, ...parsed });
      } else {
        setProfile(DEFAULT_PROFILE);
      }
    } catch {
      setProfile(DEFAULT_PROFILE);
    }
  };

  useEffect(() => {
    loadProfile();

    // Listen for settings save (custom event)
    const onProfileUpdated = () => loadProfile();
    window.addEventListener("profile-updated", onProfileUpdated as EventListener);

    // Click outside to close menu
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);

    return () => {
      window.removeEventListener("profile-updated", onProfileUpdated as EventListener);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, []);

  const logout = () => {
    // Clear all student session data
    localStorage.removeItem("codepvg_profile");
    localStorage.removeItem("codepvg_current_student");
    setMenuOpen(false);
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-border p-6 flex flex-col min-h-screen">
      {/* Profile header with menu */}
      <div className="relative mb-8" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((s) => !s)}
          className="flex items-center space-x-3 w-full text-left"
        >
          <div className="relative">
            <Image
              src={profile.photoDataUrl || "/images/profile.png"}
              alt="Profile"
              width={48}
              height={48}
              className="rounded-full border border-border"
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-lg truncate">{profile.name}</h2>
            <p className="text-muted-foreground text-sm truncate">
              {profile.branch} • {profile.year}
            </p>
          </div>
        </button>

        {menuOpen && (
          <div className="absolute z-20 mt-2 w-48 rounded-lg border border-border bg-card shadow-md">
            <Link
              href="/dashboard/settings"
              className="block px-3 py-2 text-sm hover:bg-muted rounded-t-lg"
              onClick={() => setMenuOpen(false)}
            >
              View profile
            </Link>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-b-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-2 text-sm">
        {NAV.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg transition border ${
                active
                  ? "bg-sidebar-accent/20 text-foreground border-sidebar-border"
                  : "border-transparent hover:bg-sidebar-accent/15"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile completion */}
      <div className="mt-auto pt-6">
        <div className="text-xs text-muted-foreground mb-2">Profile completion</div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-accent animate-pulse-glow"
            style={{ width: "72%" }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">72% complete</div>
      </div>
    </aside>
  );
}
