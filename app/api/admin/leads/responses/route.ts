import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const leadIds = await prisma.apiLead.findMany({
      select: {
        leadId: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const onlyLeadIds = leadIds.map(item => item.leadId);
    console.log("✅ Returning Lead IDs:", onlyLeadIds);

    return NextResponse.json(onlyLeadIds);
  } catch (error) {
    console.error("❌ Error fetching lead IDs:", error);
    return NextResponse.json({ message: "Failed to fetch lead IDs" }, { status: 500 });
  }
}
