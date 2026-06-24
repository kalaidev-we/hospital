import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

const Cross = () => (
  <span className="brand-mark" aria-hidden="true">
    <svg viewBox="0 0 32 32"><path d="M13 4h6v9h9v6h-9v9h-6v-9H4v-6h9V4Z" /></svg>
  </span>
);

function App() {
  const [mode, setMode] = useState("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setMessage(null);
    if (!isSupabaseConfigured) {
      setMessage({ type: "error", text: "Add your Supabase URL and anon key to a .env file first." });
      return;
    }
    setLoading(true);
    const credentials = { email: email.trim(), password };
    const { data, error } = mode === "signIn"
      ? await supabase.auth.signInWithPassword(credentials)
      : await supabase.auth.signUp(credentials);
    setLoading(false);
    if (error) return setMessage({ type: "error", text: error.message });
    if (mode === "signUp" && !data.session) {
      setMessage({ type: "success", text: "Account created. Check your email to confirm it." });
    }
  };

  const resetPassword = async () => {
    setMessage(null);
    if (!email || !email.includes("@")) {
      return setMessage({ type: "error", text: "Enter your email address first." });
    }
    if (!supabase) return setMessage({ type: "error", text: "Configure Supabase first." });
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    setMessage({
      type: error ? "error" : "success",
      text: error?.message ?? "Password reset instructions sent.",
    });
  };

  const switchMode = () => {
    setMode((value) => value === "signIn" ? "signUp" : "signIn");
    setMessage(null);
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setUser(null);
    setEmail("");
    setPassword("");
  };

  const signingIn = mode === "signIn";

  return (
    <main className="page-shell">
      <section className="brand-panel" aria-label="CareBridge introduction">
        <a className="brand" href="#"><Cross /><span>CareBridge</span></a>
        <div className="brand-copy">
          <p className="eyebrow">YOUR HEALTH, CONNECTED</p>
          <h1>Care that stays<br />with you.</h1>
          <p className="lead">Access appointments, health records, and your care team from one secure place.</p>
        </div>
        <div className="trust-row">
          <div className="avatar-stack" aria-hidden="true"><span>AM</span><span>JL</span><span>SK</span></div>
          <p><strong>Trusted by 12,000+</strong><br />patients and families</p>
        </div>
        <div className="orb orb-one" /><div className="orb orb-two" /><div className="grid-pattern" />
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-brand"><Cross /><span>CareBridge</span></div>
          {user ? (
            <div className="account-view">
              <div className="success-icon">✓</div>
              <p className="eyebrow dark">SIGNED IN</p>
              <h2>Good to see you.</h2>
              <p className="form-subtitle">{user.email}</p>
              <button className="primary-button" type="button" onClick={signOut}>Sign out</button>
            </div>
          ) : (
            <div>
              <p className="eyebrow dark">PATIENT PORTAL</p>
              <h2>{signingIn ? "Welcome back" : "Create your account"}</h2>
              <p className="form-subtitle">{signingIn ? "Sign in to continue to your health dashboard." : "Join CareBridge to manage your care in one place."}</p>
              <form onSubmit={submit}>
                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <div className="input-wrap">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 9 6 9-6M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" /></svg>
                    <input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="field">
                  <div className="label-row">
                    <label htmlFor="password">Password</label>
                    {signingIn && <button className="text-button" type="button" onClick={resetPassword}>Forgot password?</button>}
                  </div>
                  <div className="input-wrap">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
                    <input id="password" type={showPassword ? "text" : "password"} autoComplete={signingIn ? "current-password" : "new-password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" required />
                    <button className="icon-button" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                    </button>
                  </div>
                </div>
                {message && <div className={`message ${message.type}`} role="status">{message.text}</div>}
                <button className="primary-button" type="submit" disabled={loading}>
                  <span>{loading ? "Please wait…" : signingIn ? "Sign in" : "Create account"}</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </form>
              <p className="switch-copy">
                {signingIn ? "New to CareBridge?" : "Already have an account?"}
                <button className="text-button strong" type="button" onClick={switchMode}>{signingIn ? "Create an account" : "Sign in instead"}</button>
              </p>
            </div>
          )}
          <footer><span>Secure &amp; encrypted</span><a href="#">Privacy</a><a href="#">Help</a></footer>
        </div>
      </section>
    </main>
  );
}

export default App;
