export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="max-w-screen-lg mx-auto py-10 flex flex-col gap-5">
      {children}
    </section>
  );
}
