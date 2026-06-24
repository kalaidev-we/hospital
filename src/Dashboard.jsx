import { useEffect, useState } from "react";
import Registration from "./Registration.jsx";

export default function Dashboard({ supabase, user, onSignOut }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchTokens() {
    if (!supabase) { setError("Supabase not configured"); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("tokens").select("*").order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setTokens(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchTokens(); const iv = setInterval(fetchTokens, 5000); return () => clearInterval(iv); }, []);

  async function updateStatus(id, status) {
    if (!supabase) return;
    const { error } = await supabase.from("tokens").update({ status }).eq("id", id);
    if (error) setError(error.message);
    else fetchTokens();
  }

  return (
    <div className="signed-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="kicker dark">SIGNED IN</p>
          <h2>Welcome back.</h2>
          <p>{user.email}</p>
        </div>
        <div>
          <button className="primary" onClick={onSignOut}>Sign out</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20, marginTop: 28 }}>
        <div>
          <h3>New Registration</h3>
          <Registration supabase={supabase} onRegistered={fetchTokens} />
        </div>

        <div>
          <h3>Tokens</h3>
          {error && <div className="message error">{error}</div>}
          {loading ? <p>Loading tokens…</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Room</th>
                  <th>ETA</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tokens.map(t => (
                  <tr key={t.id} style={{ borderTop: "1px solid #e6efee" }}>
                    <td style={{ padding: 8 }}>{t.token_no}</td>
                    <td style={{ padding: 8 }}>{t.name}</td>
                    <td style={{ padding: 8 }}>{t.status}</td>
                    <td style={{ padding: 8 }}>{t.room ?? "—"}</td>
                    <td style={{ padding: 8 }}>{t.eta ?? "—"}</td>
                    <td style={{ padding: 8 }}>
                      <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)}>
                        <option value="waiting">Waiting</option>
                        <option value="in observation">In Observation</option>
                        <option value="in consultation">In Consultation</option>
                        <option value="Discharged">Discharged</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
