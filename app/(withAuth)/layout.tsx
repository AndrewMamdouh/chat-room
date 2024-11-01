"use client";

import { useAuthContext } from "@Contexts";
import { useRouter } from "next/navigation";

export default function WithAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();

  if (isLoading) return <div>Loading</div>;

  if (!user) {
    router.push("/login");
    return null;
  }

  return children;
}
