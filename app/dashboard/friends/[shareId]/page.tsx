"use client";

import { useRouter } from "next/navigation";
import { use } from "react";

import { FriendProgressDetail } from "@/components/sharing/FriendProgressPanel";

interface PageProps {
  params: Promise<{ shareId: string }>;
}

export default function FriendDetailPage({ params }: PageProps) {
  const { shareId } = use(params);
  const router = useRouter();

  return (
    <div className="dashboard-page">
      <FriendProgressDetail
        shareId={shareId}
        onBack={() => router.push("/dashboard/friends")}
      />
    </div>
  );
}
