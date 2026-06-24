import { useMemo, useState } from "react";

const doctorMap = {
  General: [
    { doctor: "Dr. Priya", room: "R101" },
    { doctor: "Dr. Suresh", room: "R102" },
  ],
  Cardiology: [
    { doctor: "Dr. Raj", room: "R102" },
    { doctor: "Dr. Neha", room: "R104" },
  ],
  Orthopedic: [
    { doctor: "Dr. Kumar", room: "R103" },
    { doctor: "Dr. Ananya", room: "R105" },
  ],
  Pediatrics: [
    { doctor: "Dr. Meera", room: "R106" },
    { doctor: "Dr. Aadesh", room: "R107" },
  ],
};

const departments = Object.keys(doctorMap);

export default function Registration({ supabase, onRegistered }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [department, setDepartment] = useState("");
  const [doctor, setDoctor] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!supabase) return setMessage({ type: "error", text: "Supabase not configured" });
    setLoading(true);
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
      department: department || null,
      doctor: doctor || null,
      room: room || null,
      status: "waiting",
      eta: null,
    };

    const { data, error } = await supabase.from("tokens").insert([payload]);
    setLoading(false);
    if (error) return setMessage({ type: "error", text: error.message });
    setName(""); setPhone(""); setDetails(""); setDepartment(""); setDoctor(""); setRoom("");
    setMessage({ type: "success", text: `Token ${token_no} created` });
    if (onRegistered) onRegistered();
  }

  const doctors = useMemo(() => doctorMap[department] || [], [department]);

  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setDepartment(selectedDepartment);
    setDoctor("");
    setRoom("");
  };

  const handleDoctorChange = (e) => {
    const selectedDoctor = e.target.value;
    setDoctor(selectedDoctor);
    const selected = doctors.find((entry) => entry.doctor === selectedDoctor);
    setRoom(selected?.room ?? "");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
      <label style={{ marginTop: 12 }}>Phone</label>
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" required />
      <label style={{ marginTop: 12 }}>Patient details</label>
      <input value={details} onChange={e => setDetails(e.target.value)} placeholder="Notes / symptoms" />
      <label style={{ marginTop: 12 }}>Department</label>
      <select value={department} onChange={handleDepartmentChange} required>
        <option value="">Select department</option>
        {departments.map((dept) => (
          <option key={dept} value={dept}>{dept}</option>
        ))}
      </select>
      <label style={{ marginTop: 12 }}>Doctor</label>
      <select value={doctor} onChange={handleDoctorChange} required disabled={!department}>
        <option value="">Select doctor</option>
        {doctors.map((entry) => (
          <option key={entry.doctor} value={entry.doctor}>{entry.doctor}</option>
        ))}
      </select>
      <label style={{ marginTop: 12 }}>Room (doctor)</label>
      <input value={room} readOnly placeholder="Room auto-selected" />
      {message && <div className={`message ${message.type}`} role="status">{message.text}</div>}
      <div style={{ marginTop: 12 }}>
        <button className="primary" disabled={loading}>{loading ? "Please wait…" : "Generate Token"}</button>
      </div>
    </form>
  );
}
