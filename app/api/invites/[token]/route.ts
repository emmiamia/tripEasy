import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;

  const invite = await prisma.tripInvite.findUnique({
    where: { token },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      invitedAt: true,
      tripId: true,
      trip: {
        select: {
          id: true,
          name: true,
          destination: true
        }
      },
      invitedBy: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  return NextResponse.json(invite);
}

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await context.params;
  const invite = await prisma.tripInvite.findUnique({
    where: { token },
    include: {
      trip: {
        select: {
          id: true,
          members: {
            select: {
              userId: true
            }
          }
        }
      }
    }
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found or expired" }, { status: 404 });
  }

  if (invite.status !== "pending") {
    return NextResponse.json({ error: "Invite already processed" }, { status: 400 });
  }

  const alreadyMember = invite.trip.members.some((member) => member.userId === session.user.id);

  await prisma.$transaction(async (tx) => {
    if (!alreadyMember) {
      await tx.tripMember.create({
        data: {
          tripId: invite.tripId,
          userId: session.user.id,
          role: invite.role
        }
      });
    }
    await tx.tripInvite.update({
      where: { id: invite.id },
      data: {
        status: "accepted",
        acceptedAt: new Date()
      }
    });
  });

  return NextResponse.json({ success: true, tripId: invite.tripId });
}

