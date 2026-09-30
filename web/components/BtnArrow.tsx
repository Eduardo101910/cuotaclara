/** Círculo con flecha que va al final de los botones principales. */
export default function BtnArrow() {
  return (
    <span className="btn-icon" aria-hidden="true">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
      </svg>
    </span>
  );
}