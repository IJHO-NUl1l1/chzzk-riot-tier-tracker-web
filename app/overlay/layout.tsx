export default function OverlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`body { background: transparent !important; }`}</style>
      {children}
    </>
  );
}
