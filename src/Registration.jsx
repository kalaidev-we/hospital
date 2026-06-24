import { useState } from "react";

export default function Registration({ supabase, onRegistered }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!supabase) return setMessage({ type: "error", text: "Supabase not configured" });
    setLoading(true);

    // Try to produce a simple incremental token number based on count
    let token_no;
    try {
      const { count, error } = await supabase.from("tokens").select("id", { count: "exact", head: true });
      if (error) throw error;
      token_no = (count || 0) + 1;
    } catch (err) {
      token_no = Math.floor(Date.now() / 1000);
    }

    const payload = {
      token_no,
      name: name.trim(),
      phone: phone.trim(),
      details: details.trim(),
      room: room.trim() || null,
      status: "waiting",
      eta: null,
    };

    const { data, error } = await supabase.from("tokens").insert([payload]);
    setLoading(false);
    if (error) return setMessage({ type: "error", text: error.message });
    setName(""); setPhone(""); setDetails(""); setRoom("");
    setMessage({ type: "success", text: `Token ${token_no} created` });
    if (onRegistered) onRegistered();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Name</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
      <label style={{ marginTop: 12 }}>Phone</label>
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" required />
      <label style={{ marginTop: 12 }}>Patient details</label>
      <input value={details} onChange={e => setDetails(e.target.value)} placeholder="Notes / symptoms" />
      <label style={{ marginTop: 12 }}>Room (doctor)</label>
      <input value={room} onChange={e => setRoom(e.target.value)} placeholder="Room or doctor" />
      {message && <div className={`message ${message.type}`} role="status">{message.text}</div>}
      <div style={{ marginTop: 12 }}>
        <button className="primary" disabled={loading}>{loading ? "Please wait…" : "Generate Token"}</button>
      </div>
    </form>
  );
}
