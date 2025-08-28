"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Trash2 } from "lucide-react";

/**
 * Profile Settings (client)
 * - Large circular avatar with camera overlay (bottom-right)
 * - Predefined avatar options (initials-style)
 * - Upload & preview (URL.createObjectURL)
 * - Remove photo button
 * - Form fields (name, email, mobile, branch, year, bio)
 * - Save profile saves to localStorage (frontend-only)
 */

type PresetAvatar = {
  id: number;
  initials: string;
  bg: string; // tailwind/inline background
  fg?: string;
};

const PRESET_AVATARS: PresetAvatar[] = [
  { id: 0, initials: "RB", bg: "linear-gradient(135deg,#FDE68A,#FCA5A5)" },
  { id: 1, initials: "AK", bg: "linear-gradient(135deg,#C7F9CC,#6EE7B7)" },
  { id: 2, initials: "SM", bg: "linear-gradient(135deg,#A5B4FC,#60A5FA)" },
  { id: 3, initials: "TV", bg: "linear-gradient(135deg,#FBCFE8,#F472B6)" },
  { id: 4, initials: "NV", bg: "linear-gradient(135deg,#FDE68A,#FCD34D)" },
];

export default function ProfileSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // uploaded image URL
  const [presetIndex, setPresetIndex] = useState<number | null>(null); // selected preset avatar
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // load saved profile from localStorage (demo)
    const savedName = localStorage.getItem("userName");
    const savedEmail = localStorage.getItem("userEmail");
    const savedMobile = localStorage.getItem("userMobile");
    const savedBranch = localStorage.getItem("userBranch");
    const savedYear = localStorage.getItem("userYear");
    const savedBio = localStorage.getItem("userBio");
    const savedAvatarUrl = localStorage.getItem("userAvatarUrl");
    const savedPreset = localStorage.getItem("userAvatarPreset");
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
    if (savedMobile) setMobile(savedMobile);
    if (savedBranch) setBranch(savedBranch);
    if (savedYear) setYear(savedYear);
    if (savedBio) setBio(savedBio);
    if (savedAvatarUrl) setAvatarUrl(savedAvatarUrl);
    if (savedPreset) setPresetIndex(Number(savedPreset));
  }, []);

  const handleFilePick = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    setPresetIndex(null);
    localStorage.setItem("userAvatarUrl", url);
    localStorage.removeItem("userAvatarPreset");
  };

  const removePhoto = () => {
    setAvatarUrl(null);
    setPresetIndex(null);
    localStorage.removeItem("userAvatarUrl");
    localStorage.removeItem("userAvatarPreset");
  };

  const pickPreset = (idx: number) => {
    setPresetIndex(idx);
    setAvatarUrl(null);
    localStorage.setItem("userAvatarPreset", String(idx));
    localStorage.removeItem("userAvatarUrl");
  };

  const saveProfile = () => {
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userMobile", mobile);
    localStorage.setItem("userBranch", branch);
    localStorage.setItem("userYear", year);
    localStorage.setItem("userBio", bio);
    alert("Profile saved locally (frontend-only).");
  };

  const renderAvatar = () => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-full h-full object-cover block"
        />
      );
    }
    if (presetIndex !== null && PRESET_AVATARS[presetIndex]) {
      const p = PRESET_AVATARS[presetIndex];
      return (
        <div
          className="w-full h-full grid place-items-center font-semibold text-2xl"
          style={{ background: p.bg }}
        >
          <span className="text-gray-900/90">{p.initials}</span>
        </div>
      );
    }
    // default initials from name
    const initials = name
      ? name
          .split(" ")
          .map((s) => s[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : null;
    return (
      <div className="w-full h-full grid place-items-center bg-muted text-muted-foreground">
        {initials || <span>No photo</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto rounded-2xl bg-card border border-border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar column */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div
                className="w-44 h-44 rounded-full border border-border overflow-hidden shadow-md"
                aria-hidden
              >
                {renderAvatar()}
              </div>

              {/* camera overlay */}
              <button
                title="Change photo"
                onClick={() => fileRef.current?.click()}
                className="absolute -right-2 -bottom-2 bg-accent text-accent-foreground rounded-full p-3 border border-border shadow-md hover:scale-105 transition-transform"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFilePick(f);
              }}
            />

            <div className="flex gap-3">
              <button
                onClick={removePhoto}
                className="flex items-center gap-2 px-3 py-1 rounded border border-border/60 bg-background text-sm"
              >
                <Trash2 className="w-4 h-4" /> Remove photo
              </button>
            </div>

            <div className="w-full">
              <div className="text-sm text-muted-foreground mb-2">Choose avatar</div>
              <div className="flex gap-3">
                {PRESET_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => pickPreset(p.id)}
                    className={`w-12 h-12 rounded-full border-2 ${presetIndex === p.id ? "ring-2 ring-accent/40" : "border-border/40"} overflow-hidden`}
                    title={`Use avatar ${p.initials}`}
                    style={{ background: p.bg }}
                  >
                    <div className="w-full h-full grid place-items-center font-semibold text-sm text-gray-900/90">{p.initials}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form column - span 2 */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Full name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Mobile</label>
                <Input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="mt-1 w-full h-10 rounded border border-border/60 px-2 bg-background"
                >
                  <option value="">Select branch</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="AIDS">AIDS</option>
                  <option value="ENTC">E&TC</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 w-full h-10 rounded border border-border/60 px-2 bg-background"
                >
                  <option value="">Select year</option>
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
                  <option value="Third Year">Third Year</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Bio (optional)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full mt-1 rounded border border-border/60 p-3 bg-background"
                  placeholder="Tell about yourself (optional)"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <Button onClick={saveProfile} className="px-6 py-2">Save profile</Button>
              <div className="text-sm text-muted-foreground">
                Changes saved locally only — backend integration later.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
