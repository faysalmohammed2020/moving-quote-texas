import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // update path if needed

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        fromIp: true,
        createdAt: true,
        fromState: true,
        fromStateCode: true,
        fromCity: true,
        fromZip: true,
        toState: true,
        toStateCode: true,
        toCity: true,
        toZip: true,
        moveDate: true,
        moveSize: true,
      },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching submissions", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
