import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Stub } from "./admin.requests";
export const Route = createFileRoute("/admin/users")({
  component: () => (<><AdminTopbar title="المستخدمون والأدوار" /><Stub label="إدارة المستخدمين والأدوار قيد التطوير" /></>),
});
