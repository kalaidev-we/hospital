import { useEffect, useState } from "react";
import { isConfigured, supabase } from "./supabase.js";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registering, setRegistering] = useState(false);
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
    const { data, error } = registering
      ? await supabase.auth.signUp(credentials)
      : await supabase.auth.signInWithPassword(credentials);
    setLoading(false);
    if (error) return setMessage({ type: "error", text: error.message });
    if (registering && !data.session) setMessage({ type: "success", text: "Account created. Check your inbox to confirm your email." });
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

  return <main className="layout">
    <section className="hero">
      <a className="brand" href="/" aria-label="CareBridge home"><span className="logo">+</span> CareBridge</a>
      <div className="hero-copy"><p className="kicker">YOUR HEALTH, CONNECTED</p><h1>Care that stays<br />with you.</h1><p>Access appointments, health records, and your care team from one secure place.</p></div>
      <small>Secure care for patients and families</small>
    </section>
    <section className="auth">
      <div className="card">
        <div className="mobile-brand"><span className="logo">+</span> CareBridge</div>
        {loading && !user ? <p>Loading…</p> : user ? <div className="signed-in"><div className="check">✓</div><p className="kicker dark">SIGNED IN</p><h2>Welcome back.</h2><p>{user.email}</p><button className="primary" onClick={signOut}>Sign out</button></div> : <>
          <p className="kicker dark">PATIENT PORTAL</p>
          <h2>{registering ? "Create account" : "Welcome back"}</h2>
          <p className="subtitle">{registering ? "Create an account to manage your care." : "Sign in to continue to your dashboard."}</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            <div className="label-row"><label htmlFor="password">Password</label>{!registering && <button className="link" type="button" onClick={forgotPassword}>Forgot password?</button>}</div>
            <div className="password"><input id="password" type={visible ? "text" : "password"} autoComplete={registering ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required /><button type="button" className="show" onClick={() => setVisible(!visible)}>{visible ? "Hide" : "Show"}</button></div>
            {message && <div className={`message ${message.type}`} role="status">{message.text}</div>}
            <button className="primary" disabled={loading}>{loading ? "Please wait…" : registering ? "Create account" : "Sign in"}</button>
          </form>
          <p className="switch">{registering ? "Already have an account?" : "New to CareBridge?"} <button className="link" onClick={() => { setRegistering(!registering); setMessage(null); }}>{registering ? "Sign in" : "Create account"}</button></p>
        </>}
      </div>
    </section>
  </main>;
}
