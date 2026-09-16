import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { AdminNav, MobileAdminNav } from "./AdminNav";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-paper-soft">
      <MobileAdminNav />
      <div className="flex min-h-screen">
        <AdminNav />
        <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
