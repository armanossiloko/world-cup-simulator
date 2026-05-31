export default function StageSection({ id, stageNumber, title, unlocked, children, sectionRef }) {
  return (
    <section
      id={id}
      ref={sectionRef}
      className={`scroll-mt-44 transition-opacity duration-500 ${
        unlocked ? 'opacity-100' : 'opacity-45'
      }`}
    >
      <div className="mb-7 flex items-center gap-4">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 font-display text-2xl text-gold">
          {stageNumber}
          {!unlocked && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-ink text-zinc-500">
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-2.5 w-2.5" aria-hidden>
                <path d="M8 1a3 3 0 0 0-3 3v2H4.5A1.5 1.5 0 0 0 3 7.5v5A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 6H11V4a3 3 0 0 0-3-3Zm1.5 5h-3V4a1.5 1.5 0 0 1 3 0v2Z" />
              </svg>
            </span>
          )}
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-600">
            Stage {stageNumber} of 4
          </p>
          <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}
