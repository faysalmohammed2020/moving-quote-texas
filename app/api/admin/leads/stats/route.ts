import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay, subDays } from "date-fns";

export async function GET() {
  try {
    const today = new Date();

    const leadCounts = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const day = subDays(today, i);
        const count = await prisma.lead.count({
          where: {
            createdAt: {
              gte: startOfDay(day),
              lt: endOfDay(day),
            },
          },
        });
        return { date: day.toISOString().split("T")[0], count };
      })
    );

    const responseCounts = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const day = subDays(today, i);
        const count = await prisma.apiLead.count({
          where: {
            createdAt: {
              gte: startOfDay(day),
              lt: endOfDay(day),
            },
          },
        });
        return { date: day.toISOString().split("T")[0], count };
      })
    );

    const totalLeads = await prisma.lead.count();
    const totalResponses = await prisma.apiLead.count();

    return NextResponse.json({
      totalLeads,
      totalResponses,
      dailyLeads: leadCounts.reverse(),
      dailyResponses: responseCounts.reverse(),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("API Error in /api/admin/leads/stats:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
