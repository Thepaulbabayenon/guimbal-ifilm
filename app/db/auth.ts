import { auth } from "@clerk/nextjs/server";

export function getUser() {
  const { userId } = auth();
  if (!userId) return null;
  return { id: userId };
}
