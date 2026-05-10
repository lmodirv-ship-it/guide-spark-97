import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Stub } from "./admin.requests";
export const Route = createFileRoute("/admin/reviews")({
  component: () => (<><AdminTopbar title="التقييمات والمراجعات" /><Stub label="إدارة التقييمات قيد التطوير" /></>),
});
