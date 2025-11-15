import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertTripRole } from "@/lib/authorization";
import { sendTripInviteEmail } from "@/lib/email";

interface RouteContext {
  params: Promise<{ tripId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await context.params;
  const membership = await assertTripRole(session.user.id, tripId);
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invites = await prisma.tripInvite.findMany({
    where: { tripId },
    orderBy: { invitedAt: "desc" }
  });

  return NextResponse.json(invites);
}

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await context.params;
  const membership = await assertTripRole(session.user.id, tripId, ["OWNER", "EDITOR"]);
  if (!membership) {
    return NextResponse.json({ error: "Only owners or editors can invite collaborators." }, { status: 403 });
  }

  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      members: {
        some: { userId: session.user.id }
      }
    },
    select: {
      id: true,
      name: true
    }
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  try {
    const { email, role = "VIEWER" } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existingInvite = await prisma.tripInvite.findFirst({
      where: {
        tripId,
        email,
        status: "pending"
      }
    });

    if (existingInvite) {
      return NextResponse.json({ error: "An invite has already been sent to this email." }, { status: 409 });
    }

    const invite = await prisma.tripInvite.create({
      data: {
        tripId,
        email,
        role,
        invitedById: session.user.id,
        token: nanoid(32),
        status: "pending"
      }
    });

    try {
      await sendTripInviteEmail({
        to: email,
        token: invite.token,
        tripName: trip.name,
        invitedBy: session.user.name ?? session.user.email ?? "A teammate"
      });
    } catch (emailError: any) {
      await prisma.tripInvite.delete({ where: { id: invite.id } });
      throw emailError;
    }

    return NextResponse.json(invite, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message ?? "Unable to create invite" }, { status: 400 });
  }
}


