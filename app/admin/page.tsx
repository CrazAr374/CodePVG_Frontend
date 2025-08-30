"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, BarChart3, FolderPlus, Trash2, UserCheck, UserX, Clock, CheckCircle, XCircle } from "lucide-react";

// Types
type Problem = {
  id: string;
  title: string;
  topic?: string;
  year?: string; // e.g., "First Year", "Second Year"
  department?: string; // e.g., "CSE", "ECE"
  difficulty?: "Easy" | "Medium" | "Hard";
};

type Assignment = Problem & { assigned: true };

type Progress = {
  year: string;
  completed: number;
  total: number;
};

type DeptProgress = {
  department: string;
  completed: number;
  total: number;
};

type StudentProject = {
  id: string;
  studentName: string;
  title: string;
  link?: string;
  department: string;
  year: string;
};

type PendingStudent = {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  studentId: string;
  branch: string;
  year: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  password: string;
};

const YEAR_OPTIONS = ["First Year", "Second Year", "Third Year", "Final Year"];
const DEPT_OPTIONS = ["CSE", "IT", "ECE", "EEE", "MECH"];

export default function AdminDashboard() {
  const router = useRouter();
  const [dataset, setDataset] = useState<Problem[]>([]);
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [assignYear, setAssignYear] = useState<string>(YEAR_OPTIONS[0]);
  const [assignDept, setAssignDept] = useState<string>(DEPT_OPTIONS[0]);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [projFilterDept, setProjFilterDept] = useState<string>(DEPT_OPTIONS[0]);
  const [projFilterYear, setProjFilterYear] = useState<string>(YEAR_OPTIONS[0]);
  const [newProj, setNewProj] = useState<{ studentName: string; title: string; link: string; department: string; year: string }>({
    studentName: "",
    title: "",
    link: "",
    department: DEPT_OPTIONS[0],
    year: YEAR_OPTIONS[0],
  });
  const [rankDept, setRankDept] = useState<string | null>(null);
  const [rankYear, setRankYear] = useState<string | "All">("All");
  // Upload & auto-assign controls
  const [autoAssignOnUpload, setAutoAssignOnUpload] = useState<boolean>(true);
  const [defaultYear, setDefaultYear] = useState<string>(YEAR_OPTIONS[0]);
  const [defaultDept, setDefaultDept] = useState<string>(DEPT_OPTIONS[0]);
  const [assignMode, setAssignMode] = useState<"merge" | "replace">("merge");
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");

  const saveDataset = (list: Problem[]) => {
    setDataset(list);
    localStorage.setItem("codepvg_problems_dataset", JSON.stringify(list));
    window.dispatchEvent(new Event("problems-updated"));
  };

  // Load any existing dataset from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("codepvg_problems_dataset");
      if (raw) setDataset(JSON.parse(raw));
    } catch {}
    try {
      const rawProj = localStorage.getItem("codepvg_student_projects");
      if (rawProj) setProjects(JSON.parse(rawProj));
    } catch {}
    try {
      const rawPending = localStorage.getItem("codepvg_pending_students");
      if (rawPending) setPendingStudents(JSON.parse(rawPending));
    } catch {}
    
    // Listen for pending students updates
    const handlePendingUpdate = () => {
      try {
        const rawPending = localStorage.getItem("codepvg_pending_students");
        if (rawPending) setPendingStudents(JSON.parse(rawPending));
      } catch {}
    };
    
    window.addEventListener("pending-students-updated", handlePendingUpdate);
    return () => window.removeEventListener("pending-students-updated", handlePendingUpdate);
  }, []);

  const toggleSelect = (id: string) =>
    setSelectedIds((s) => ({ ...s, [id]: !s[id] }));

  const selectedProblems = useMemo(
    () => dataset.filter((p) => selectedIds[p.id]),
    [dataset, selectedIds]
  );

  const yearProgress: Progress[] = useMemo(() => {
    // Demo: derive pseudo progress counts by year from assignments store
    const storeRaw = localStorage.getItem("codepvg_assigned_problems");
    const store: Assignment[] = storeRaw ? JSON.parse(storeRaw) : [];
    const byYear: Record<string, { completed: number; total: number }> = {};
    YEAR_OPTIONS.forEach((y) => (byYear[y] = { completed: 0, total: 0 }));
    store.forEach((a) => {
      if (!a.year) return;
      byYear[a.year] ||= { completed: 0, total: 0 } as any;
      byYear[a.year].total += 1;
      // Demo completion heuristic
      if ((a.title.length + (a.department?.length || 0)) % 3 === 0) byYear[a.year].completed += 1;
    });
    return Object.entries(byYear).map(([year, v]) => ({ year, ...v }));
  }, []);

  const deptProgress: DeptProgress[] = useMemo(() => {
    const storeRaw = localStorage.getItem("codepvg_assigned_problems");
    const store: Assignment[] = storeRaw ? JSON.parse(storeRaw) : [];
    const byDept: Record<string, { completed: number; total: number }> = {};
    DEPT_OPTIONS.forEach((d) => (byDept[d] = { completed: 0, total: 0 }));
    store.forEach((a) => {
      const d = a.department || DEPT_OPTIONS[0];
      byDept[d] ||= { completed: 0, total: 0 } as any;
      byDept[d].total += 1;
      if ((a.title.length + (a.year?.length || 0)) % 2 === 0) byDept[d].completed += 1;
    });
    return Object.entries(byDept).map(([department, v]) => ({ department, ...v }));
  }, []);

  const normalizeYear = (y?: string): string | undefined => {
    if (!y) return undefined;
    const norm = y.trim().toLowerCase();
    const map: Record<string, string> = {
      "first": "First Year",
      "first year": "First Year",
      "1": "First Year",
      "second": "Second Year",
      "second year": "Second Year",
      "2": "Second Year",
      "third": "Third Year",
      "third year": "Third Year",
      "3": "Third Year",
      "final": "Final Year",
      "final year": "Final Year",
      "4": "Final Year",
    };
    const found = YEAR_OPTIONS.find((opt) => opt.toLowerCase() === norm) || map[norm];
    return (found as string) || undefined;
  };

  const normalizeDept = (d?: string): string | undefined => {
    if (!d) return undefined;
    const norm = d.trim().toUpperCase();
    return DEPT_OPTIONS.includes(norm) ? norm : undefined;
  };

  // Delete problems (from dataset) and optionally unassign from students)
  const deleteProblems = (ids: string[], alsoUnassign: boolean) => {
    if (ids.length === 0) return;
    // Update dataset
    const updated = dataset.filter((p) => !ids.includes(p.id));
    saveDataset(updated);
    // Clear selections for removed ids
    setSelectedIds((prev) => {
      const copy = { ...prev } as Record<string, boolean>;
      ids.forEach((id) => delete copy[id]);
      return copy;
    });

    if (alsoUnassign) {
      const existingRaw = localStorage.getItem("codepvg_assigned_problems");
      const existing: Assignment[] = existingRaw ? JSON.parse(existingRaw) : [];
      const filtered = existing.filter((a) => !ids.includes(a.id));
      localStorage.setItem("codepvg_assigned_problems", JSON.stringify(filtered));
      window.dispatchEvent(new Event("assigned-problems-updated"));
    }
  };

  const persistAssignments = (toAssign: Assignment[], mode: "merge" | "replace") => {
    const existingRaw = localStorage.getItem("codepvg_assigned_problems");
    const existing: Assignment[] = existingRaw ? JSON.parse(existingRaw) : [];

    let newStore: Assignment[] = [];
    if (mode === "replace") {
      // Remove existing for the cohorts present in toAssign
      const cohorts = new Set(toAssign.map(a => `${a.year}|${a.department}`));
      newStore = existing.filter((e) => !cohorts.has(`${e.year}|${e.department}`));
    } else {
      newStore = existing.slice();
    }

    // Deduplicate by id+year+department
    const seen = new Set(newStore.map((e) => `${e.id}|${e.year}|${e.department}`));
    for (const a of toAssign) {
      const key = `${a.id}|${a.year}|${a.department}`;
      if (!seen.has(key)) {
        newStore.push(a);
        seen.add(key);
      }
    }

    localStorage.setItem("codepvg_assigned_problems", JSON.stringify(newStore));
    window.dispatchEvent(new Event("assigned-problems-updated"));
    return newStore.length - existing.length; // delta
  };

  const onUpload = async (file: File) => {
    setUploadMessage("");
    setUploadError("");
    const text = await file.text();
    let data: Problem[] = [];
    try {
      if (file.name.endsWith(".json")) {
        const parsed = JSON.parse(text);
        data = Array.isArray(parsed)
          ? parsed.map((p: any, idx: number) => ({
              id: p.id || String(idx + 1),
              title: p.title || `Problem ${idx + 1}`,
              topic: p.topic,
              difficulty: p.difficulty,
              year: normalizeYear(p.year) || undefined,
              department: normalizeDept(p.department) || undefined,
            }))
          : [];
      } else if (file.name.endsWith(".csv")) {
        // CSV with header support. Expected headers (any order): id,title,topic,difficulty,year,department
        const rows = text.split(/\r?\n/).filter((r) => r.trim().length > 0);
        const header = rows[0].split(",").map((h) => h.trim().toLowerCase());
        const index = (name: string) => header.indexOf(name);
        const iId = index("id"), iTitle = index("title"), iTopic = index("topic"), iDiff = index("difficulty"), iYear = index("year"), iDept = index("department");
        const start = header.includes("title") ? 1 : 0; // if no header, treat first row as data
        const body = rows.slice(start);
        data = body.map((row, idx) => {
          const cols = row.split(",");
          const id = (iId >= 0 ? cols[iId] : cols[0]) || String(idx + 1);
          const title = (iTitle >= 0 ? cols[iTitle] : cols[1]) || `Problem ${idx + 1}`;
          const topic = iTopic >= 0 ? cols[iTopic] : undefined;
          const difficulty = (iDiff >= 0 ? (cols[iDiff] as any) : undefined) as Problem["difficulty"];
          const year = normalizeYear(iYear >= 0 ? cols[iYear] : undefined);
          const department = normalizeDept(iDept >= 0 ? cols[iDept] : undefined);
          return { id, title, topic, difficulty, year, department } as Problem;
        });
      }
    } catch (e: any) {
      setUploadError(`Failed to parse file: ${e?.message || "Unknown error"}`);
    }
    if (autoAssignOnUpload) {
      // For each problem, ensure year/department using defaults when missing
      const toAssign: Assignment[] = data.map((p, i) => ({
        ...p,
        year: p.year || defaultYear,
        department: p.department || defaultDept,
        assigned: true,
      }));
      const added = persistAssignments(toAssign, assignMode);
      setUploadMessage(`Uploaded ${data.length} problems and assigned. Added ${added} new assignments (${assignMode}). Removed uploaded items from dataset.`);
      // Remove from dataset after assigning
      saveDataset([]);
    } else {
      // Keep dataset if not auto-assigning
      saveDataset(data);
    }
  };

  const saveProjects = (list: StudentProject[]) => {
    setProjects(list);
    localStorage.setItem("codepvg_student_projects", JSON.stringify(list));
  };

  const addProject = () => {
    if (!newProj.studentName.trim() || !newProj.title.trim()) return alert("Student name and project title are required");
    const item: StudentProject = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      studentName: newProj.studentName.trim(),
      title: newProj.title.trim(),
      link: newProj.link.trim() || undefined,
      department: newProj.department,
      year: newProj.year,
    };
    const updated = [item, ...projects];
    saveProjects(updated);
    setNewProj({ studentName: "", title: "", link: "", department: newProj.department, year: newProj.year });
  };

  const filteredProjects = useMemo(
    () => projects.filter(p => p.department === projFilterDept && p.year === projFilterYear),
    [projects, projFilterDept, projFilterYear]
  );

  const departmentRankings = useMemo(() => {
    if (!rankDept) return [] as { studentName: string; count: number; years: Set<string> }[];
    const rows = projects.filter(p => p.department === rankDept && (rankYear === "All" || p.year === rankYear));
    const map = new Map<string, { studentName: string; count: number; years: Set<string> }>();
    rows.forEach(p => {
      const key = p.studentName.trim() || "Unnamed";
      const entry = map.get(key) || { studentName: key, count: 0, years: new Set<string>() };
      entry.count += 1;
      entry.years.add(p.year);
      map.set(key, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count || a.studentName.localeCompare(b.studentName));
  }, [projects, rankDept, rankYear]);

  const assignSelected = () => {
    const existingRaw = localStorage.getItem("codepvg_assigned_problems");
    const existing: Assignment[] = existingRaw ? JSON.parse(existingRaw) : [];

    const toAssign: Assignment[] = selectedProblems.map((p) => ({
      ...p,
      year: assignYear,
      department: assignDept,
      assigned: true,
    }));

    const newStore = [...existing, ...toAssign];
    localStorage.setItem("codepvg_assigned_problems", JSON.stringify(newStore));
    // Remove assigned items from dataset
    const assignedIds = new Set(selectedProblems.map(p => p.id));
    const remaining = dataset.filter(p => !assignedIds.has(p.id));
    saveDataset(remaining);
    setSelectedIds({});
    alert(`Assigned ${toAssign.length} problems to ${assignYear} - ${assignDept}. Removed them from dataset.`);
    window.dispatchEvent(new Event("assigned-problems-updated"));
  };

  // Student validation functions
  const approveStudent = (studentId: string) => {
    const updated = pendingStudents.map(student => 
      student.id === studentId 
        ? { ...student, status: 'approved' as const }
        : student
    );
    
    setPendingStudents(updated);
    localStorage.setItem('codepvg_pending_students', JSON.stringify(updated));
    
    // Create approved student profile
    const approvedStudent = updated.find(s => s.id === studentId);
    if (approvedStudent) {
      const studentProfile = {
        id: approvedStudent.id,
        name: `${approvedStudent.firstName} ${approvedStudent.middleName || ''} ${approvedStudent.lastName}`.trim(),
        email: approvedStudent.email,
        studentId: approvedStudent.studentId,
        branch: approvedStudent.branch,
        year: approvedStudent.year,
        phone: '',
        photoDataUrl: null,
        approved: true,
        approvedAt: new Date().toISOString()
      };
      
      // Store in approved students list
      const existingApprovedRaw = localStorage.getItem('codepvg_approved_students');
      const existingApproved = existingApprovedRaw ? JSON.parse(existingApprovedRaw) : [];
      const updatedApproved = [studentProfile, ...existingApproved];
      localStorage.setItem('codepvg_approved_students', JSON.stringify(updatedApproved));
    }
    
    window.dispatchEvent(new Event('pending-students-updated'));
    alert(`Student ${approvedStudent?.firstName} ${approvedStudent?.lastName} has been approved!`);
  };

  const rejectStudent = (studentId: string) => {
    const updated = pendingStudents.map(student => 
      student.id === studentId 
        ? { ...student, status: 'rejected' as const }
        : student
    );
    
    setPendingStudents(updated);
    localStorage.setItem('codepvg_pending_students', JSON.stringify(updated));
    window.dispatchEvent(new Event('pending-students-updated'));
    
    const rejectedStudent = updated.find(s => s.id === studentId);
    alert(`Student ${rejectedStudent?.firstName} ${rejectedStudent?.lastName} has been rejected.`);
  };

  const deleteStudentRecord = (studentId: string) => {
    const updated = pendingStudents.filter(student => student.id !== studentId);
    setPendingStudents(updated);
    localStorage.setItem('codepvg_pending_students', JSON.stringify(updated));
    window.dispatchEvent(new Event('pending-students-updated'));
  };

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

      {/* Student Validation Section */}
      <div className="p-6 rounded-xl border bg-card space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <UserCheck className="text-primary" />
            <h2 className="font-semibold text-lg">Student Account Validation</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{pendingStudents.filter(s => s.status === 'pending').length} pending approvals</span>
          </div>
        </div>

        {pendingStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No pending student registrations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-background">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-medium text-lg">
                      {student.firstName} {student.middleName && student.middleName + ' '}{student.lastName}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                      student.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                      'bg-red-500/10 text-red-600'
                    }`}>
                      {student.status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
                      {student.status === 'approved' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {student.status === 'rejected' && <XCircle className="w-3 h-3 inline mr-1" />}
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Email:</span> {student.email}
                    </div>
                    <div>
                      <span className="font-medium">Student ID:</span> {student.studentId}
                    </div>
                    <div>
                      <span className="font-medium">Branch:</span> {student.branch}
                    </div>
                    <div>
                      <span className="font-medium">Year:</span> {student.year}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">Submitted:</span> {new Date(student.submittedAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {student.status === 'pending' && (
                    <>
                      <button
                        onClick={() => approveStudent(student.id)}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => rejectStudent(student.id)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Delete record for ${student.firstName} ${student.lastName}?`)) {
                        deleteStudentRecord(student.id);
                      }
                    }}
                    className="p-2 rounded-md border hover:bg-muted text-destructive"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-4"><BarChart3 className="text-primary" /> <h2 className="font-semibold text-lg">Year-wise Progress</h2></div>
          <div className="space-y-3">
            {yearProgress.map((y) => {
              const pct = y.total ? Math.round((y.completed / y.total) * 100) : 0;
              return (
                <div key={y.year}>
                  <div className="flex justify-between text-sm mb-1"><span>{y.year}</span><span>{y.completed}/{y.total}</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-4"><BarChart3 className="text-secondary" /> <h2 className="font-semibold text-lg">Department-wise Progress</h2></div>
          <div className="space-y-3">
            {deptProgress.map((d) => {
              const pct = d.total ? Math.round((d.completed / d.total) * 100) : 0;
              return (
                <button key={d.department} onClick={() => router.push(`/admin/department/${encodeURIComponent(d.department)}`)} className="w-full text-left">
                  <div className="flex justify-between text-sm mb-1"><span className="underline-offset-2 hover:underline">{d.department}</span><span>{d.completed}/{d.total}</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-secondary" style={{ width: `${pct}%` }} /></div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dataset Upload & Assign */}
      <div className="p-6 rounded-xl border bg-card space-y-6">
        <div className="flex items-center gap-3"><FolderPlus /><h2 className="font-semibold text-lg">Upload Problems Dataset</h2></div>
        <label className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-muted w-fit">
          <Upload className="w-4 h-4" />
          <span>Upload .json or .csv</span>
          <input type="file" accept=".json,.csv" className="hidden" onChange={(e) => e.target.files && onUpload(e.target.files[0])} />
        </label>

        {/* Auto-assign controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="flex items-center gap-2 col-span-1">
            <input type="checkbox" checked={autoAssignOnUpload} onChange={(e) => setAutoAssignOnUpload(e.target.checked)} />
            <span className="text-sm">Auto-assign on upload</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Default Year</span>
            <select value={defaultYear} onChange={(e) => setDefaultYear(e.target.value)} className="border rounded-md px-3 py-2">
              {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Default Dept</span>
            <select value={defaultDept} onChange={(e) => setDefaultDept(e.target.value)} className="border rounded-md px-3 py-2">
              {DEPT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm text-muted-foreground">Mode</label>
            <label className="flex items-center gap-1 text-sm">
              <input type="radio" name="assign-mode" checked={assignMode === "merge"} onChange={() => setAssignMode("merge")} /> Merge
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input type="radio" name="assign-mode" checked={assignMode === "replace"} onChange={() => setAssignMode("replace")} /> Replace cohorts
            </label>
          </div>
        </div>

        {dataset.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <select value={assignYear} onChange={(e) => setAssignYear(e.target.value)} className="border rounded-md px-3 py-2">
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={assignDept} onChange={(e) => setAssignDept(e.target.value)} className="border rounded-md px-3 py-2">
                {DEPT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <button onClick={assignSelected} className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50" disabled={selectedProblems.length === 0}>
                Assign Selected ({selectedProblems.length})
              </button>
              <button
                onClick={() => {
                  if (selectedProblems.length === 0) return;
                  const ids = selectedProblems.map((p) => p.id);
                  const also = confirm(`Delete ${ids.length} selected problem(s)?\n\nOK: Delete from dataset and unassign from all students\nCancel: Only delete from dataset`);
                  deleteProblems(ids, also);
                }}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md disabled:opacity-50"
                disabled={selectedProblems.length === 0}
              >
                Delete Selected
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {dataset.map((p, idx) => (
                <div key={`${p.id}-${idx}`} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-background">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={!!selectedIds[p.id]} onChange={() => toggleSelect(p.id)} />
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.topic || "General"} • {p.difficulty || "Medium"}</div>
                      {(p.year || p.department) && (
                        <div className="text-[10px] text-muted-foreground">{p.year || defaultYear} • {p.department || defaultDept}</div>
                      )}
                    </div>
                  </label>
                  <button
                    title="Delete"
                    className="p-2 rounded-md border hover:bg-muted text-destructive"
                    onClick={() => {
                      const also = confirm(`Delete this problem?\n\nOK: Delete from dataset and unassign from all students\nCancel: Only delete from dataset`);
                      deleteProblems([p.id], also);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Student Projects */}
      <div className="p-6 rounded-xl border bg-card space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-semibold text-lg">Student Projects</h2>
          <div className="flex items-center gap-2">
            <select value={projFilterYear} onChange={(e) => setProjFilterYear(e.target.value)} className="border rounded-md px-3 py-2">
              {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={projFilterDept} onChange={(e) => setProjFilterDept(e.target.value)} className="border rounded-md px-3 py-2">
              {DEPT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Add project form */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            placeholder="Student Name"
            value={newProj.studentName}
            onChange={(e) => setNewProj({ ...newProj, studentName: e.target.value })}
            className="border rounded-md px-3 py-2"
          />
          <input
            placeholder="Project Title"
            value={newProj.title}
            onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
            className="border rounded-md px-3 py-2"
          />
          <input
            placeholder="Project Link (optional)"
            value={newProj.link}
            onChange={(e) => setNewProj({ ...newProj, link: e.target.value })}
            className="border rounded-md px-3 py-2"
          />
          <select value={newProj.year} onChange={(e) => setNewProj({ ...newProj, year: e.target.value })} className="border rounded-md px-3 py-2">
            {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex gap-2">
            <select value={newProj.department} onChange={(e) => setNewProj({ ...newProj, department: e.target.value })} className="border rounded-md px-3 py-2 flex-1">
              {DEPT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <button onClick={addProject} className="px-4 py-2 bg-primary text-primary-foreground rounded-md whitespace-nowrap">Add</button>
          </div>
        </div>

        {/* Projects list */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Student</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Link</th>
                <th className="py-2 pr-4">Year</th>
                <th className="py-2 pr-4">Department</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 && (
                <tr>
                  <td className="py-3 text-muted-foreground" colSpan={5}>No projects yet for {projFilterYear} - {projFilterDept}.</td>
                </tr>
              )}
              {filteredProjects.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{p.studentName}</td>
                  <td className="py-2 pr-4">{p.title}</td>
                  <td className="py-2 pr-4">
                    {p.link ? (<a href={p.link} target="_blank" rel="noreferrer" className="text-primary hover:underline">Open</a>) : (<span className="text-muted-foreground">—</span>)}
                  </td>
                  <td className="py-2 pr-4">{p.year}</td>
                  <td className="py-2 pr-4">{p.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Departmental Rankings moved to dedicated page */}
    </div>
  );
}
