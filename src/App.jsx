import { useEffect, useState } from "react";
import { isConfigured, supabase } from "./supabase.js";
import Dashboard from "./Dashboard.jsx";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);
    if (!isConfigured) return setMessage({ type: "error", text: "Supabase is not configured. Check your .env file." });
    setLoading(true);
    const credentials = { email: email.trim(), password };
    const { error } = await supabase.auth.signInWithPassword(credentials);
    setLoading(false);
    if (error) return setMessage({ type: "error", text: error.message });
  }

  async function forgotPassword() {
    if (!email.includes("@")) return setMessage({ type: "error", text: "Enter your email address first." });
    if (!supabase) return setMessage({ type: "error", text: "Supabase is not configured." });
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    setMessage({ type: error ? "error" : "success", text: error?.message ?? "Password reset email sent." });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setPassword("");
  }

  return <main className={`layout ${user ? "dashboard-mode" : ""}`}>
    <section className="hero">
      <a className="brand" href="/" aria-label="CareBridge home"><span className="logo">+</span> hospital Dashboard</a>
      <div className="hero-copy"><p className="kicker">Waiting Queue</p><h1>Management<br />Dashboard</h1><p>Access appointments,tokens.</p></div>
      <small>Secure care for patients and families</small>
    </section>
    <section className="auth">
      <div className="card">
        <div className="mobile-brand"><span className="logo">+</span> hospital Dashboard</div>
        {loading && !user ? <p>Loading…</p> : user ? <Dashboard supabase={supabase} user={user} onSignOut={signOut} /> : <>
          <p className="kicker dark">waiting queue DASHBOARD</p>
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in with the authorized account to continue.</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            <div className="label-row"><label htmlFor="password">Password</label><button className="link" type="button" onClick={forgotPassword}>Forgot password?</button></div>
            <div className="password"><input id="password" type={visible ? "text" : "password"} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" minLength={6} required /><button type="button" className="show" onClick={() => setVisible(!visible)}>{visible ? "Hide" : "Show"}</button></div>
            {message && <div className={`message ${message.type}`} role="status">{message.text}</div>}
            <button className="primary" disabled={loading}>{loading ? "Please wait…" : "Sign in"}</button>
          </form>
        </>}
      </div>
    </section>
  </main>;
}
