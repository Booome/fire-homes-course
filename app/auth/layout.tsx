export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 w-screen max-w-screen-sm mx-auto">{children}</div>
  );
}
