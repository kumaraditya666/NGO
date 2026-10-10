import { redirect } from "next/navigation";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

// Canonical login lives at /admin/login; /admin keeps working as an alias.
export default function AdminIndex() {
  redirect("/admin/login");
}
