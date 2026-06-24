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

  useEffect(() => {
    fetchTokens();
    const iv = setInterval(fetchTokens, 5000);
    return () => clearInterval(iv);
  }, []);

  async function updateStatus(id, status) {
    if (!supabase) return;
    const { error } = await supabase.from("tokens").update({ status }).eq("id", id);
    if (error) setError(error.message);
    else fetchTokens();
  }

  const stats = {
    total: tokens.length,
    waiting: tokens.filter((t) => t.status === "waiting").length,
    observation: tokens.filter((t) => t.status === "in observation").length,
    visiting: tokens.filter((t) => t.status === "visiting doctor" || t.status === "in consultation").length,
  };

  const normalizeStatus = (status) => status?.toLowerCase().replace(/\s+/g, "-") ?? "unknown";

  return (
    <div className="signed-in dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="kicker dark">SIGNED IN</p>
          <h2>Welcome back.</h2>
          <p>{user.email}</p>
        </div>
        <button className="primary" onClick={onSignOut}>Sign out</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total tokens</p>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Waiting</p>
          <p className="stat-value">{stats.waiting}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">In observation</p>
          <p className="stat-value">{stats.observation}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">With doctor</p>
          <p className="stat-value">{stats.visiting}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <h3>New Registration</h3>
          <Registration supabase={supabase} onRegistered={fetchTokens} />
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <h3>Tokens</h3>
            <small>{loading ? "Refreshing…" : `${tokens.length} records found`}</small>
          </div>
          {error && <div className="message error">{error}</div>}
          {loading ? (
            <p>Loading tokens…</p>
          ) : (
            <table className="token-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Room</th>
                  <th>ETA</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t.id}>
                    <td>{t.token_no}</td>
                    <td>{t.name}</td>
                    <td>
                      <span className={`status-badge status-${normalizeStatus(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>{t.room ?? "—"}</td>
                    <td>{t.eta ?? "—"}</td>
                    <td>
                      <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)}>
                        <option value="waiting">Waiting</option>
                        <option value="in observation">In Observation</option>
                        <option value="in consultation">In Consultation</option>
                        <option value="visiting doctor">Visiting Doctor</option>
                        <option value="Admitted">Admitted</option>
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
        </section>
      </div>
    </div>
  );
}
