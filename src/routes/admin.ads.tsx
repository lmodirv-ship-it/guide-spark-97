import { createFileRoute } from "@tanstack/react-router";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Stub } from "./admin.requests";
export const Route = createFileRoute("/admin/ads")({
  component: () => (<><AdminTopbar title="الإعلانات والاشتراكات" /><Stub label="نظام الإعلانات والاشتراكات قيد التطوير" /></>),
});
