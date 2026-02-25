import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

export async function POST(req: Request) {
  try {
    const body = await req.json(); 
    const { leadId, callrail } = body;
    const bangladeshTime = new Date(new Date().getTime() + 6 * 60 * 60 * 1000);
    const savedLead = await prisma.apiLead.create({
      data: {
        leadId,
        callrail,
        createdAt: bangladeshTime,
      },
    });

    return NextResponse.json(savedLead, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error saving lead" }, { status: 500 });
  }
}
