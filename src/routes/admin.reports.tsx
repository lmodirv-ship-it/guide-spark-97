import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Stub } from "./admin.requests";
export const Route = createFileRoute("/admin/reports")({
  component: () => (<><AdminTopbar title="التقارير والإحصائيات" /><Stub label="التقارير المتقدمة قيد التطوير" /></>),
});
