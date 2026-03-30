import { Quiz } from "@/components/Quiz";

export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/bg/bg1.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative z-10">
        <Quiz />
      </div>
    </main>
  );
}
