"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function CandidateDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'opportunities' | 'profile'>('opportunities')
  const [profileData, setProfileData] = useState<any>(null)
  const [fullName, setFullName] = useState("")
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

    if (profile.role !== 'candidate') {
      router.push('/employer')
      return
    }

    setProfileData(profile)
    setFullName(profile.full_name || "")

    // Fetch all jobs
    const { data } = await supabase.from('jobs').select('*, profiles(email, full_name)').order('created_at', { ascending: false })
    if (data) setJobs(data)
    setLoading(false)
  }

  const saveProfile = async () => {
    if (!profileData) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', profileData.id)
    if (error) {
      alert("Error saving profile. Make sure to run the SQL command to add the full_name column!")
    } else {
      setProfileData({ ...profileData, full_name: fullName })
      alert("Profile updated successfully!")
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-accent animate-pulse">Loading Opportunities...</div>

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex flex-col gap-6 border-b border-border pb-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-bold font-mono tracking-tighter mb-2">Candidate <span className="text-accent">Portal</span></h1>
              <p className="text-muted font-mono">Discover roles and prove your skills</p>
            </div>
            <button onClick={handleLogout} className="text-sm font-mono text-muted hover:text-red-400 transition-colors">Log Out</button>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('opportunities')} className={`font-mono pb-2 border-b-2 transition-colors ${activeTab === 'opportunities' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-text'}`}>Opportunities</button>
            <button onClick={() => setActiveTab('profile')} className={`font-mono pb-2 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-text'}`}>My Profile</button>
          </div>
        </header>

        {activeTab === 'opportunities' ? (
          <section className="space-y-6">
          <h2 className="text-2xl font-mono text-text">Open Positions</h2>
          
          {jobs.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl p-12 text-center text-muted font-mono">
              No open positions at the moment. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {jobs.map(job => (
                <div key={job.id} className="bg-surface border border-border shadow-sm p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-accent/50 transition-colors">
                  <div>
                    <h3 className="text-xl font-mono text-accent mb-2">{job.title}</h3>
                    <p className="text-xs font-mono text-muted">Posted by: {job.profiles?.full_name || job.profiles?.email}</p>
                    <p className="text-xs font-mono text-muted mt-1">{new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => router.push(`/candidate/job/${job.id}`)}
                    className="bg-accent/10 text-accent border border-accent/30 px-6 py-2 rounded-lg font-mono font-bold hover:bg-accent hover:text-background transition-all"
                  >
                    Apply & Assess →
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        ) : (
          <section className="bg-surface border border-border p-8 rounded-3xl max-w-lg">
            <h2 className="text-2xl font-mono text-text mb-6">Profile Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-mono text-muted mb-2">Account Email</label>
                <input type="text" disabled value={profileData?.email || ""} className="w-full bg-background border border-border rounded-xl p-3 text-sm opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-mono text-muted mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent"
                  placeholder="John Doe"
                />
              </div>
              <button 
                onClick={saveProfile} 
                disabled={saving}
                className="w-full bg-accent text-white px-6 py-3 rounded-xl font-mono font-bold hover:scale-[1.02] shadow-md transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
