"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Shield, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup")
  const [userType, setUserType] = useState<"student" | "admin">("student")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    middleName: "",
    lastName: "",
    studentId: "",
    adminCode: "",
    department: "",
    branch: "",
    year: "",
  })
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Handle login
    if (authMode === 'login') {
      if (userType === 'admin') {
        router.push('/admin')
      } else {
        // Check if student is approved
        const approvedStudentsRaw = localStorage.getItem('codepvg_approved_students')
        const approvedStudents = approvedStudentsRaw ? JSON.parse(approvedStudentsRaw) : []
        const student = approvedStudents.find((s: any) => s.email === formData.email)
        
        if (student) {
          // Store current student session
          localStorage.setItem('codepvg_current_student', JSON.stringify(student))
          router.push('/dashboard')
        } else {
          // Check if student is pending or rejected
          const pendingStudentsRaw = localStorage.getItem('codepvg_pending_students')
          const pendingStudents = pendingStudentsRaw ? JSON.parse(pendingStudentsRaw) : []
          const pendingStudent = pendingStudents.find((s: any) => s.email === formData.email)
          
          if (pendingStudent) {
            if (pendingStudent.status === 'pending') {
              alert('Your account is still pending admin approval. Please wait for approval.')
            } else if (pendingStudent.status === 'rejected') {
              alert('Your account has been rejected. Please contact the administrator.')
            }
          } else {
            alert('Account not found. Please check your credentials or register first.')
          }
        }
      }
      return
    }
    
    // Handle signup
    if (userType === 'admin') {
      // Admin signup - create account immediately
      router.push('/admin')
    } else {
      // Student signup - store for admin validation
      const pendingStudent = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        email: formData.email,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        studentId: formData.studentId,
        branch: formData.branch,
        year: formData.year,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        password: formData.password // In real app, this would be hashed
      }
      
      // Get existing pending students
      const existingRaw = localStorage.getItem('codepvg_pending_students')
      const existing = existingRaw ? JSON.parse(existingRaw) : []
      
      // Check if email already exists
      const emailExists = existing.some((s: any) => s.email === formData.email)
      if (emailExists) {
        alert('An account with this email already exists. Please use a different email or try logging in.')
        return
      }
      
      // Add new student to pending list
      const updated = [pendingStudent, ...existing]
      localStorage.setItem('codepvg_pending_students', JSON.stringify(updated))
      
      // Dispatch event to notify admin dashboard
      window.dispatchEvent(new Event('pending-students-updated'))
      
      // Show confirmation message instead of redirecting
      alert('Registration submitted successfully! Your account is pending admin approval. You will be notified once approved.')
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        middleName: '',
        lastName: '',
        studentId: '',
        adminCode: '',
        department: '',
        branch: '',
        year: '',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/15 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-secondary/20 to-accent/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30"></div>
      </div>

      <div className="relative bg-background/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full border border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-accent/5 via-secondary/5 to-accent/5 p-8 border-b border-border/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-accent/10 rounded-xl border border-accent/20">
                <Image src="/images/codepvg-logo.png" alt="CodePVG Logo" width={28} height={28} className="w-7 h-7" />
              </div>
              <span className="font-heading text-xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                CodePVG
              </span>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:bg-muted/50 rounded-full border border-border/30">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-3">
              {authMode === "login" ? "Welcome Back!" : "Join CodePVG"}
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              {authMode === "login"
                ? "Sign in to continue your coding journey and track your progress"
                : "Start your personalized learning experience with our community"}
            </p>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <label className="text-sm font-semibold text-foreground mb-4 block">Select your role:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUserType("student")}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 group ${
                  userType === "student"
                    ? "border-accent bg-gradient-to-br from-accent/10 to-accent/5 text-accent shadow-lg"
                    : "border-border hover:border-accent/50 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <GraduationCap className="h-7 w-7 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                <div className="font-semibold text-base">Student</div>
                <div className="text-xs opacity-75 mt-1">Learn & Practice DSA</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType("admin")}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 group ${
                  userType === "admin"
                    ? "border-secondary bg-gradient-to-br from-secondary/10 to-secondary/5 text-secondary shadow-lg"
                    : "border-border hover:border-secondary/50 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <Shield className="h-7 w-7 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                <div className="font-semibold text-base">Admin</div>
                <div className="text-xs opacity-75 mt-1">Manage Platform</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {authMode === "signup" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">First Name</label>
                    <Input
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="h-12 rounded-xl border-border/50 focus:border-accent transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Middle Name</label>
                    <Input
                      name="middleName"
                      placeholder="A."
                      value={formData.middleName}
                      onChange={handleInputChange}
                      className="h-12 rounded-xl border-border/50 focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">Last Name</label>
                    <Input
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="h-12 rounded-xl border-border/50 focus:border-accent transition-colors"
                      required
                    />
                  </div>
                </div>

                {userType === "student" ? (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Student ID</label>
                      <Input
                        name="studentId"
                        placeholder="Your college student ID"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl border-border/50 focus:border-accent transition-colors"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Enter your official college student ID</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">Branch</label>
                        <Select
                          value={formData.branch}
                          onValueChange={(v) =>
                            setFormData((prev) => ({ ...prev, branch: v }))
                          }
                        >
                          <SelectTrigger className="h-12 rounded-xl border-border/50">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CSE">CSE</SelectItem>
                            <SelectItem value="IT">IT</SelectItem>
                            <SelectItem value="AIDS">AIDS</SelectItem>
                            <SelectItem value="ENTC">ENTC</SelectItem>
                            <SelectItem value="MECH">MECH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">Year</label>
                        <Select
                          value={formData.year}
                          onValueChange={(v) =>
                            setFormData((prev) => ({ ...prev, year: v }))
                          }
                        >
                          <SelectTrigger className="h-12 rounded-xl border-border/50">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FE">FE</SelectItem>
                            <SelectItem value="SE">SE</SelectItem>
                            <SelectItem value="TE">TE</SelectItem>
                            <SelectItem value="BE">BE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Department</label>
                      <Input
                        name="department"
                        placeholder="Computer Science"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl border-border/50 focus:border-secondary transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">Admin Access Code</label>
                      <Input
                        name="adminCode"
                        placeholder="Enter admin access code"
                        value={formData.adminCode}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl border-border/50 focus:border-secondary transition-colors"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Contact your institution for the access code</p>
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Email Address</label>
              <Input
                name="email"
                type="email"
                placeholder={userType === "admin" ? "admin@college.edu" : "your.email@college.edu"}
                value={formData.email}
                onChange={handleInputChange}
                className="h-12 rounded-xl border-border/50 focus:border-accent transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Password</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-12 rounded-xl pr-12 border-border/50 focus:border-accent transition-colors"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-auto p-1.5 hover:bg-muted/50 rounded-lg"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {authMode === "signup" && (
                <p className="text-xs text-muted-foreground mt-1">Use at least 8 characters with letters and numbers</p>
              )}
            </div>

            {authMode === "signup" && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Confirm Password</label>
                <div className="relative">
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="h-12 rounded-xl pr-12 border-border/50 focus:border-accent transition-colors"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-auto p-1.5 hover:bg-muted/50 rounded-lg"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-accent via-accent to-secondary hover:from-accent/90 hover:via-accent/90 hover:to-secondary/90 text-accent-foreground py-4 font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {authMode === "login"
                ? `Sign In as ${userType === "admin" ? "Admin" : "Student"}`
                : `Create ${userType === "admin" ? "Admin" : "Student"} Account`}
            </Button>
          </form>

          {authMode === "login" && (
            <div className="text-center mt-6">
              <Button variant="link" className="text-sm text-muted-foreground hover:text-accent font-medium">
                Forgot your password?
              </Button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="text-sm text-muted-foreground">
              {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
              <Button
                variant="link"
                className="ml-1 p-0 h-auto font-semibold text-accent hover:text-accent/80 transition-colors"
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              >
                {authMode === "login" ? "Sign up here" : "Sign in here"}
              </Button>
            </p>

            {authMode === "signup" && (
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}