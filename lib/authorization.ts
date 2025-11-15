import { prisma } from "./prisma";

export async function getTripMembership(userId: string, tripId: string) {
  return prisma.tripMember.findFirst({
    where: {
      tripId,
      userId
    }
  });
}

export async function assertTripRole(userId: string, tripId: string, roles: string[] = ["OWNER", "EDITOR", "VIEWER"]) {
  const membership = await getTripMembership(userId, tripId);
  if (!membership || !roles.includes(membership.role)) {
    return null;
  }
  return membership;
}


