const LETTERS = [
  { char: 't', color: '#a78bfa' },
  { char: 'u', color: '#60a5fa' },
  { char: 'n', color: '#34d399' },
  { char: 'e', color: '#fbbf24' },
  { char: 'r', color: '#f87171' },
]

export function InfoModal({ onClose }) {
  return (
    <div className="info-modal-backdrop" onClick={onClose}>
      <div className="info-modal" onClick={(e) => e.stopPropagation()}>
        <button className="info-modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <img className="info-modal-icon" src="/favicon.svg" alt="" width="48" height="48" />
        <h2 className="info-modal-logo">
          {LETTERS.map((l, i) => (
            <span key={i} style={{ color: l.color }}>{l.char}</span>
          ))}
        </h2>
        <p className="info-modal-tagline">A simple, ad-free, distraction-free musical tuner.</p>
        <p className="info-modal-note">Android app coming soon.</p>
      </div>
    </div>
  )
}
