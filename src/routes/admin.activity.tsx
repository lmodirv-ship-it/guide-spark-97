import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Stub } from "./admin.requests";
export const Route = createFileRoute("/admin/activity")({
  component: () => (<><AdminTopbar title="سجل النشاطات" /><Stub label="سجل النشاطات قيد التطوير" /></>),
});
