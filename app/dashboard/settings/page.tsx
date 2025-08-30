"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";

type Profile = {
  name: string;
  email: string;
  phone: string;
  year: string;
  branch: string;
  photoDataUrl?: string;
};

const DEFAULT_PROFILE: Profile = {
  name: "Rameshwar Bhumbar",
  email: "rameshwar@example.com",
  phone: "",
  year: "Third Year",
  branch: "CSE",
};

const YEARS = ["First Year", "Second Year", "Third Year", "Final Year"];
const BRANCHES = ["CSE", "IT", "AIDS", "E&TC", "Mechanical", "Civil", "Electrical"];

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const canSavePassword = useMemo(
    () => pw.next.length >= 6 && pw.next === pw.confirm,
    [pw]
  );

  // Load current values from localStorage
  useEffect(() => {
    try {
      // First check if there's a current student session
      const currentStudentRaw = localStorage.getItem("codepvg_current_student");
      if (currentStudentRaw) {
        const currentStudent = JSON.parse(currentStudentRaw);
        // Initialize profile from approved student data
        const initialProfile = {
          name: currentStudent.name,
          email: currentStudent.email,
          phone: '',
          year: currentStudent.year,
          branch: currentStudent.branch,
          photoDataUrl: currentStudent.photoDataUrl || null
        };
        setProfile({ ...DEFAULT_PROFILE, ...initialProfile });
        
        // Also save to profile storage for consistency
        localStorage.setItem("codepvg_profile", JSON.stringify({ ...DEFAULT_PROFILE, ...initialProfile }));
        return;
      }
      
      // Fallback to existing profile data
      const raw = localStorage.getItem("codepvg_profile");
      if (raw) {
        const parsed = JSON.parse(raw) as Profile;
        setProfile({ ...DEFAULT_PROFILE, ...parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  const onChange =
    (field: keyof Profile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setProfile((p) => ({ ...p, [field]: e.target.value }));
    };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((p) => ({ ...p, photoDataUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setProfile((p) => ({ ...p, photoDataUrl: undefined }));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");

    try {
      localStorage.setItem("codepvg_profile", JSON.stringify(profile));
      // notify Sidebar to refresh
      window.dispatchEvent(new Event("profile-updated"));
      setSavedMsg("Profile saved successfully.");
    } catch {
      setSavedMsg("Failed to save. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 2000);
    }
  };

  const updatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // UI-only demo. No backend call here.
    if (!canSavePassword) {
      setSavedMsg("Password mismatch or too short.");
      setTimeout(() => setSavedMsg(""), 2000);
      return;
    }
    setPw({ current: "", next: "", confirm: "" });
    setSavedMsg("Password updated (UI only).");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile information and account preferences.
        </p>
      </div>

      {/* Profile details */}
      <form onSubmit={saveProfile} className="rounded-xl bg-card border border-border/70 shadow-sm">
        <div className="p-5 border-b border-border/60">
          <h2 className="text-base font-semibold">Profile</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Your details are stored locally for demo (no backend).
          </p>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photo */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-4">
              <img
                src={profile.photoDataUrl || "/images/profile.png"}
                alt="Profile"
                className="w-20 h-20 rounded-full border border-border object-cover"
              />
              <div className="space-y-2">
                <label className="inline-block">
                  <span className="px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-muted/70 cursor-pointer text-sm">
                    Change photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPhotoChange}
                    className="hidden"
                  />
                </label>
                {profile.photoDataUrl && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Full name</label>
              <input
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
                value={profile.name}
                onChange={onChange("name")}
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <input
                type="email"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
                value={profile.email}
                onChange={onChange("email")}
                placeholder="you@college.edu"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Mobile number</label>
              <input
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
                value={profile.phone}
                onChange={onChange("phone")}
                placeholder="+91 9xxxxxxxxx"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Year</label>
              <select
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
                value={profile.year}
                onChange={onChange("year")}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Branch</label>
              <select
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
                value={profile.branch}
                onChange={onChange("branch")}
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save details"}
          </button>
          {savedMsg && <span className="ml-3 text-sm text-muted-foreground">{savedMsg}</span>}
        </div>
      </form>

      {/* Security (password) */}
      <form onSubmit={updatePassword} className="rounded-xl bg-card border border-border/70 shadow-sm">
        <div className="p-5 border-b border-border/60">
          <h2 className="text-base font-semibold">Security</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Password update is UI-only until backend is connected.
          </p>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Current password</label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
              value={pw.current}
              onChange={(e) => setPw((x) => ({ ...x, current: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">New password</label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
              value={pw.next}
              onChange={(e) => setPw((x) => ({ ...x, next: e.target.value }))}
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Confirm new password</label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
              value={pw.confirm}
              onChange={(e) => setPw((x) => ({ ...x, confirm: e.target.value }))}
              placeholder="Re-enter new password"
            />
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            type="submit"
            disabled={!canSavePassword}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            Update password
          </button>
          {!canSavePassword && (
            <span className="ml-3 text-xs text-muted-foreground">
              (Passwords must match; min 6 chars)
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
