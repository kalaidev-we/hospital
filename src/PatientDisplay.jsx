export default function PatientDisplay({ tokens, onBack }) {
  const time = new Date();
  const formattedTime = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const waitingTokens = tokens
    .filter((token) => token.status === "waiting")
    .sort((a, b) => a.token_no - b.token_no);

  const nowServing = tokens.find((token) => ["in consultation", "visiting doctor"].includes(token.status)) || waitingTokens[0] || null;
  const nextTokens = waitingTokens.slice(0, 3).map((t) => t.token_no);

  return (
    <div className="display-screen">
      <div className="display-board-header">
        <div>
          <p className="display-board-title">PATIENT DISPLAY</p>
          <p className="display-board-subtitle">Hospital queue information</p>
        </div>
        <div className="display-board-time">{formattedTime}</div>
      </div>

      <div className="display-board-grid">
        <div className="board-card now-serving-card">
          <div className="board-card-label">NOW SERVING</div>
          <div className="board-card-value">{nowServing ? `T${String(nowServing.token_no).padStart(3, "0")}` : "—"}</div>
          <div className="board-card-meta">{nowServing?.room ? `Room ${nowServing.room}` : "Room —"}</div>
        </div>

        <div className="board-card next-tokens-card">
          <div className="board-card-label">NEXT TOKENS</div>
          <div className="next-list">
            {nextTokens.length > 0 ? nextTokens.map((tokenNo, index) => (
              <div key={tokenNo} className={`next-row next-row-${index + 1}`}>
                <span>{String(tokenNo).padStart(3, "0")}</span>
              </div>
            )) : <div className="empty-state">No next tokens</div>}
          </div>
        </div>
      </div>

      <div className="display-footer">
        <button className="secondary back-button" type="button" onClick={onBack}>Back to dashboard</button>
      </div>
    </div>
  );
}
