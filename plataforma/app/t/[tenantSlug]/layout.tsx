export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  return <div className="container mx-auto px-4 py-6">{children}</div>;
}
