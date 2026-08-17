// One shareable link that tiles /popo and /family side by side, each in its own
// iframe (its own browsing context — SSE, localStorage, audio all behave exactly
// like two separate windows). No nav crosses between them, same as the real thing.
export default function DemoPage() {
  return (
    <div className="flex h-dvh w-dvw bg-[#111]">
      <iframe
        src="/family"
        title="Family view"
        className="h-full flex-1 border-0"
        style={{ maxWidth: 640 }}
      />
      <div className="w-px bg-black/40" />
      <iframe src="/popo" title="Popo view" className="h-full flex-[1.3] border-0" />
    </div>
  );
}
