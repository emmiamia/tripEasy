import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AcceptInviteCard } from "@/components/trips/accept-invite-card";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invites/${token}`)}`);
  }

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
    notFound();
  }

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <AcceptInviteCard
        invite={{
          token,
          email: invite.email,
          tripName: invite.trip.name,
          destination: invite.trip.destination,
          role: invite.role,
          status: invite.status,
          invitedBy: invite.invitedBy?.name ?? invite.invitedBy?.email ?? "A teammate"
        }}
      />
    </section>
  );
}

