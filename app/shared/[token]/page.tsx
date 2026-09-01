import { SharedProgressPage } from "@/components/sharing/SharedProgressPage";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function Page({ params }: PageProps) {
  const { token } = await params;
  return <SharedProgressPage token={token} />;
}
