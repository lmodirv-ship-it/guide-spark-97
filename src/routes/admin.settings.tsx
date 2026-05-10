import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Stub } from "./admin.requests";
export const Route = createFileRoute("/admin/settings")({
  component: () => (<><AdminTopbar title="إعدادات الموقع" /><Stub label="الإعدادات العامة قيد التطوير" /></>),
});
