import Link from "next/link";
import { appConfig } from "@/config/app";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <Link href="/" className="mb-8 block text-center">
        <span className="text-2xl font-bold text-slate-900">
          {appConfig.name}
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
