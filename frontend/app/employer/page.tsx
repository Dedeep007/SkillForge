"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import UploadZone from "@/components/upload/UploadZone"

export default function EmployerDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [jdText, setJdText] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [creating, setCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard')
  const [profileData, setProfileData] = useState<any>(null)
  const [companyName, setCompanyName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    
    if (error || !profile) {
      await supabase.auth.signOut()
      router.push('/login')
      return
    }

    if (profile.role !== 'employer') {
      router.push('/candidate')
      return
    }

    setProfileData(profile)
    setCompanyName(profile.full_name || "")

    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    if (data) setJobs(data)
    setLoading(false)
  }

  const saveProfile = async () => {
    if (!profileData) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ full_name: companyName }).eq('id', profileData.id)
    if (error) {
      alert("Error saving profile. Make sure to run the SQL command to add the full_name column!")
    } else {
      setProfileData({ ...profileData, full_name: companyName })
      alert("Company Profile updated successfully!")
    }
    setSaving(false)
  }

  const handleCreateJob = async () => {
    if (!jobTitle || !jdText) return
    setCreating(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('jobs').insert({
      employer_id: user.id,
      title: jobTitle,
      jd_text: jdText
    })

    setCreating(false)
    if (!error) {
      setJobTitle("")
      setJdText("")
      fetchJobs()
    }
  }

  const handleDeleteJob = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this job posting? All candidate assessments for this job will also be deleted permanently.")) return
    
    const { error } = await supabase.from('jobs').delete().eq('id', jobId)
    if (error) {
      alert("Failed to delete job")
    } else {
      fetchJobs()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-accent animate-pulse">Loading Dashboard...</div>

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col gap-6 border-b border-border pb-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-bold font-mono tracking-tighter mb-2">Employer <span className="text-accent">Portal</span></h1>
              <p className="text-muted font-mono">Manage jobs and review candidate assessments</p>
            </div>
            <button onClick={handleLogout} className="text-sm font-mono text-muted hover:text-red-400 transition-colors">Log Out</button>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('dashboard')} className={`font-mono pb-2 border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-text'}`}>Dashboard</button>
            <button onClick={() => setActiveTab('profile')} className={`font-mono pb-2 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-text'}`}>Company Profile</button>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface border border-border shadow-sm p-6 rounded-2xl">
              <h2 className="text-xl font-mono text-accent mb-6">Post New Job</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-muted mb-2">Job Title</label>
                  <input 
                    type="text" 
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-accent outline-none"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
                
                <div className="pt-2">
                  <UploadZone label="Job Description (PDF)" endpoint="jd" onUpload={setJdText} />
                </div>

                <button
                  onClick={handleCreateJob}
                  disabled={creating || !jobTitle || !jdText}
                  className="w-full bg-accent text-background font-bold font-mono py-3 rounded-xl hover:brightness-110 disabled:opacity-50 mt-4"
                >
                  {creating ? "Posting..." : "Create Job"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-mono text-text">Your Active Jobs</h2>
            
            {jobs.length === 0 ? (
              <div className="border border-dashed border-border rounded-2xl p-12 text-center text-muted font-mono">
                No jobs posted yet. Post your first job to start receiving candidates!
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className="bg-surface border border-border p-6 rounded-2xl hover:border-accent/50 transition-colors flex justify-between items-center group cursor-pointer" onClick={() => router.push(`/employer/job/${job.id}`)}>
                    <div>
                      <h3 className="text-lg font-mono text-accent mb-1">{job.title}</h3>
                      <p className="text-xs text-muted font-mono">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-muted group-hover:text-accent group-hover:-translate-x-1 transition-all">
                        View Candidates →
                      </div>
                      <button 
                        onClick={(e) => handleDeleteJob(e, job.id)}
                        className="text-muted hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
                        title="Delete Job"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        ) : (
          <section className="bg-surface border border-border shadow-sm p-8 rounded-3xl max-w-lg shadow-xl">
            <h2 className="text-2xl font-mono text-accent mb-6 flex items-center">
              <span className="w-8 h-px bg-accent/50 mr-4"></span>
              Company Details
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-mono text-muted mb-2">Account Email</label>
                <input type="text" disabled value={profileData?.email || ""} className="w-full bg-background border border-border rounded-xl p-3 text-sm opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-mono text-muted mb-2">Company Name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent text-text"
                  placeholder="Acme Corp"
                />
              </div>
              <button 
                onClick={saveProfile} 
                disabled={saving}
                className="w-full bg-accent text-white px-6 py-3 rounded-xl font-mono font-bold hover:scale-[1.02] shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Company Profile"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
