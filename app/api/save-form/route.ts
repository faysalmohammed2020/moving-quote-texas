import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // basic validation
    if (
      !data.first_name ||
      !data.last_name ||
      !data.email ||
      !data.phone ||
      !data.lead_type ||
      !data.lead_source
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // normalize
    const emailNorm: string = String(data.email).trim().toLowerCase();
    const phoneNorm: string = String(data.phone).replace(/[^0-9]/g, "");

    // move date (optional)
    let moveDateObj: Date | null = null;
    if (data.move_date && String(data.move_date).trim() !== "") {
      const tempDate = new Date(data.move_date);
      if (!isNaN(tempDate.getTime())) moveDateObj = tempDate;
    }

    // Bangladesh time (+6h)
    const getBangladeshTime = () => new Date(Date.now() + 6 * 60 * 60 * 1000);

    // ✅ duplicate guard (email OR phone)
    const existing = await prisma.lead.findFirst({
      where: {
        OR: [{ email: emailNorm }, { phone: phoneNorm }],
      },
      select: { id: true, email: true, phone: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Duplicate email or phone number" },
        { status: 409 }
      );
    }

    // save
    const formSubmission = await prisma.lead.create({
      data: {
        key: data.key ?? "",
        leadType: data.lead_type ?? "",
        leadSource: data.lead_source ?? "",
        referer: data.referer ?? "",
        fromIp: data.from_ip ?? "",
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        email: emailNorm,
        phone: phoneNorm,
        fromState: data.from_state ?? "",
        fromStateCode: data.from_state_code ?? "",
        fromCity: data.from_city ?? "",
        fromZip: data.from_zip ?? "",
        toState: data.to_state ?? "",
        toStateCode: data.to_state_code ?? "",
        toCity: data.to_city ?? "",
        toZip: data.to_zip ?? "",
        moveDate: moveDateObj,
        moveSize: data.move_size ?? "",
        selfPackaging: false,
        hasCar: false,
        carMake: data.car_make || null,
        carModel: data.car_model || null,
        carMakeYear: data.car_make_year || null,
        createdAt: getBangladeshTime(),
      },
    });

    return NextResponse.json(
      { message: "Form submitted successfully", data: formSubmission },
      { status: 200 }
    );
  } catch (error: unknown) {
    // fallback if DB unique constraint exists
    const code =
      error && typeof error === "object"
        ? (error as Record<string, unknown>).code
        : undefined;

    if (String(code) === "P2002") {
      return NextResponse.json(
        { message: "Duplicate email or phone number" },
        { status: 409 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { message: "Server error", error: message },
      { status: 500 }
    );
  }
}
