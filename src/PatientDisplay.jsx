export default function PatientDisplay({ tokens, onBack }) {
  const time = new Date();
  const formattedTime = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const patientWindow = [...tokens]
    .filter((token) => ["waiting", "in observation", "in consultation", "visiting doctor"].includes(token.status))
    .sort((a, b) => a.token_no - b.token_no);

  const nowServing = patientWindow.find((token) => ["in consultation", "visiting doctor"].includes(token.status)) || null;
  const waitingTokens = patientWindow.filter((token) => token.status === "waiting").sort((a, b) => a.token_no - b.token_no);

  const nextItems = waitingTokens.slice(0, 5);

  return (
    <div className="display-screen display-screen-full">
      <div className="display-board-header">
        <div>
          <p className="display-board-title">PATIENT DISPLAY</p>
          <p className="display-board-subtitle">Hospital queue and doctor room information</p>
        </div>
        <div className="display-board-time">{formattedTime}</div>
      </div>

      {waitingTokens.length > 0 && (
        <div className="display-alert">
          <strong>Attention:</strong> Please remain seated until the doctor calls the next patient. The current consultation is in progress.
        </div>
      )}

      <div className="display-board-grid display-full-grid">
        <section className="board-card now-serving-card">
          <div className="board-card-label">NOW SERVING</div>
          <div className="board-card-value">{nowServing ? `T${String(nowServing.token_no).padStart(3, "0")}` : "—"}</div>
          <div className="board-card-meta">{nowServing?.name ? `Patient: ${nowServing.name}` : "Patient: —"}</div>
          <div className="board-card-meta">{nowServing?.department ?? "Department —"}</div>
          <div className="board-card-meta">{nowServing?.doctor ?? "Doctor —"}</div>
          <div className="board-card-meta">{nowServing?.room ? `Room ${nowServing.room}` : "Room —"}</div>
          <div className="board-card-status">{nowServing?.status ?? "Waiting"}</div>
        </section>

        <section className="board-card next-tokens-card">
          <div className="board-card-label">NEXT TOKENS</div>
          <div className="next-table">
            {nextItems.length > 0 ? (
              <>
                <div className="next-table-head">
                  <span>Token</span>
                  <span>Doctor</span>
                  <span>Room</span>
                  <span>Status</span>
                </div>
                {nextItems.map((token, index) => (
                  <div key={token.id} className={`next-row next-row-${index + 1}`}>
                    <span>{`T${String(token.token_no).padStart(3, "0")}`}</span>
                    <span>{token.doctor || "—"}</span>
                    <span>{token.room || "—"}</span>
                    <span>{token.status || "Waiting"}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="empty-state">No next tokens</div>
            )}
          </div>
        </section>
      </div>

      <div className="display-footer">
        <button className="secondary back-button" type="button" onClick={onBack}>Back to dashboard</button>
      </div>
    </div>
  );
}
