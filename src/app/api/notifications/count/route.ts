import { NextResponse } from "next/server";

import { getPendingConnectionCount } from "@/lib/connections/data";
import { getUnreadMessageCount } from "@/lib/messages/data";
import { getAuthUserId } from "@/lib/supabase/server";

export async function GET() {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({
      pendingConnections: 0,
      total: 0,
      unreadMessages: 0,
    });
  }

  const [pendingConnections, unreadMessages] = await Promise.all([
    getPendingConnectionCount(),
    getUnreadMessageCount(),
  ]);

  return NextResponse.json({
    pendingConnections,
    total: pendingConnections + unreadMessages,
    unreadMessages,
  });
}
