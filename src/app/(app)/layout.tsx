import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100%', minWidth: 1180 }}>
      <Sidebar />
      <main style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
        {children}
      </main>
    </div>
  );
}
