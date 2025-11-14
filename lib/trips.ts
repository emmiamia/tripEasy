import { prisma } from "./prisma";
import type {
  Activity,
  Trip,
  TripDay,
  Lodging,
  TransportSegment,
  PackingItem,
  TripTask,
  Expense,
  TripNote
} from "@prisma/client";
import { differenceInCalendarDays } from "date-fns";

export type TripWithRelations = Trip & {
  days: (TripDay & { activities: Activity[] })[];
  lodgings: Lodging[];
  segments: TransportSegment[];
  packingItems: PackingItem[];
  tasks: TripTask[];
  expenses: Expense[];
  notes: TripNote[];
  companions: { id: string; name: string; email: string | null; status: string }[];
};

export type TripWithMetrics = Trip & {
  days: (TripDay & { activities: Activity[] })[];
  packingItems: PackingItem[];
  tasks: TripTask[];
  expenses: Expense[];
  totalActivities: number;
  packedCount: number;
  taskCompletion: number;
  totalExpense: number;
};

export async function getTrips(): Promise<TripWithMetrics[]> {
  const trips = await prisma.trip.findMany({
    include: {
      days: {
        include: {
          activities: true
        }
      },
      packingItems: true,
      tasks: true,
      expenses: true
    },
    orderBy: { startDate: "asc" }
  });

  return trips.map((trip) => ({
    ...trip,
    totalActivities: trip.days.reduce((acc, day) => acc + day.activities.length, 0),
    packedCount: trip.packingItems.filter((item) => item.isPacked).length,
    taskCompletion: trip.tasks.length
      ? Math.round(
          (trip.tasks.filter((task) => task.isComplete).length / trip.tasks.length) * 100
        )
      : 0,
    totalExpense: trip.expenses.reduce((acc, expense) => acc + expense.amount, 0)
  }));
}

export async function getTripById(id: string): Promise<TripWithRelations | null> {
  return prisma.trip.findUnique({
    where: { id },
    include: {
      days: { include: { activities: true }, orderBy: { date: "asc" } },
      lodgings: { orderBy: { checkIn: "asc" } },
      segments: { orderBy: { departureTime: "asc" } },
      packingItems: { orderBy: { category: "asc" } },
      companions: { orderBy: { name: "asc" } },
      tasks: { orderBy: { dueDate: "asc" } },
      expenses: { orderBy: { date: "desc" } },
      notes: { orderBy: { createdAt: "desc" } }
    }
  });
}

export async function getTripSummary(id: string) {
  const trip = await getTripById(id);
  if (!trip) return null;

  const dayCount = differenceInCalendarDays(trip.endDate, trip.startDate) + 1;
  const budget = trip.expenses.reduce((acc, item) => acc + item.amount, 0);
  const categories = trip.expenses.reduce<Record<string, number>>((acc, exp) => {
    acc[exp.category] = (acc[exp.category] ?? 0) + exp.amount;
    return acc;
  }, {});

  const activityMap = trip.days.flatMap((day) => day.activities);

  return {
    trip,
    dayCount,
    budget,
    categoryBreakdown: categories,
    upcomingTasks: trip.tasks.filter((task) => !task.isComplete).slice(0, 5),
    mapPoints: activityMap
      .filter((activity) => activity.locationLat && activity.locationLng)
      .map((activity) => ({
        id: activity.id,
        title: activity.title,
        lat: activity.locationLat!,
        lng: activity.locationLng!,
        category: activity.category,
        day: trip.days.find((day) => day.id === activity.dayId)?.date
      }))
  };
}

export type TripSummary = NonNullable<Awaited<ReturnType<typeof getTripSummary>>>;
