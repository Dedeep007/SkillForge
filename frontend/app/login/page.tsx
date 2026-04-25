"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("candidate")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Strict check for allowed email domains
    const allowedDomains = ["@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com", "@icloud.com"]
    const hasValidDomain = allowedDomains.some(domain => email.toLowerCase().endsWith(domain))
    
    if (!hasValidDomain) {
      setError("Please use a standard email provider (e.g., @gmail.com, @yahoo.com)")
      setLoading(false)
      return
    }

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      
      // Fetch role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      if (profile?.role === 'employer') {
        router.push('/employer')
      } else {
        router.push('/candidate')
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          role
        })
        if (profileError) {
          setError(profileError.message)
          setLoading(false)
          return
        }
        if (role === 'employer') {
          router.push('/employer')
        } else {
          router.push('/candidate')
        }
      }
    }
  }

  return (
    <div className="min-h-screen relative bg-bg text-text flex items-center justify-center p-6 overflow-hidden">
      <div className="relative z-10 max-w-md w-full bg-surface border border-border shadow-md p-8 rounded-3xl shadow-xl">
        <h1 className="text-4xl font-bold font-mono text-center tracking-tighter mb-2">
          SkillForge<span className="text-accent">.ai</span>
        </h1>
        <h2 className="text-lg text-center text-muted font-mono mb-8">{isLogin ? "Access your portal" : "Create your account"}</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm font-mono">{error}</div>}
        
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider font-mono text-muted mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-mono text-muted mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          {!isLogin && (
            <div>
              <label className="block text-xs uppercase tracking-wider font-mono text-muted mb-2">I am a...</label>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setRole("candidate")}
                  className={`flex-1 p-3 rounded-xl border font-mono transition-all duration-300 ${role === "candidate" ? "border-accent bg-accent/10 text-accent shadow-sm" : "border-border bg-background text-muted hover:border-border"}`}
                >
                  Candidate
                </button>
                <button 
                  type="button"
                  onClick={() => setRole("employer")}
                  className={`flex-1 p-3 rounded-xl border font-mono transition-all duration-300 ${role === "employer" ? "border-accent bg-accent/10 text-accent shadow-sm" : "border-border bg-background text-muted hover:border-border"}`}
                >
                  Employer
                </button>
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-accent text-white font-bold font-mono py-4 rounded-xl hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:hover:scale-100 transition-all mt-4"
          >
            {loading ? "Authenticating..." : (isLogin ? "Secure Login →" : "Create Account →")}
          </button>
        </form>
        
        <div className="text-center mt-8 text-muted text-sm font-mono">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-accent hover:underline">
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      </div>
    </div>
  )
}
