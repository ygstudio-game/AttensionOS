import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Welcome to AttentionOS
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Your one-stop solution for enhancing focus and productivity.
        </p>
      </div>
    </div>
  );
}
