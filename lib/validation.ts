import { z } from "zod";

export const tripSchema = z.object({
  name: z.string().min(2),
  destination: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  travelStyle: z.string().optional().default("ADVENTURE"),
  currency: z.string().default("USD")
});

export const activitySchema = z.object({
  dayId: z.string(),
  title: z.string().min(2),
  subtitle: z.string().optional().nullable(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  locationCity: z.string().optional().nullable(),
  locationName: z.string().optional().nullable(),
  locationLat: z.number().optional().nullable(),
  locationLng: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  category: z.string().optional().default("OTHER"),
  cost: z.number().optional().nullable(),
  bookingLink: z.string().optional().nullable()
});

export const tripDaySchema = z.object({
  tripId: z.string(),
  date: z.string(),
  summary: z.string().optional().nullable()
});

export const packingItemSchema = z.object({
  tripId: z.string(),
  name: z.string().min(1),
  category: z.string().default("General"),
  quantity: z.number().int().default(1),
  isPacked: z.boolean().optional().default(false)
});

export const taskSchema = z.object({
  tripId: z.string(),
  title: z.string().min(2),
  dueDate: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  isComplete: z.boolean().optional().default(false)
});

export const expenseSchema = z.object({
  tripId: z.string(),
  description: z.string().min(2),
  amount: z.number().nonnegative(),
  currency: z.string().default("USD"),
  date: z.string(),
  category: z.string().default("MISC"),
  paidBy: z.string().optional().nullable()
});

export const noteSchema = z.object({
  tripId: z.string(),
  content: z.string().min(1)
});

export const lodgingSchema = z.object({
  tripId: z.string(),
  name: z.string().min(1),
  address: z.string().optional().nullable(),
  checkIn: z.string(),
  checkOut: z.string(),
  confirmationNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  url: z.string().optional().nullable()
});

export const transportSegmentSchema = z.object({
  tripId: z.string(),
  type: z.string().min(1),
  carrier: z.string().optional().nullable(),
  confirmationNumber: z.string().optional().nullable(),
  departureCity: z.string().min(1),
  arrivalCity: z.string().min(1),
  departureTime: z.string(),
  arrivalTime: z.string(),
  seat: z.string().optional().nullable()
});

export const companionSchema = z.object({
  tripId: z.string(),
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  status: z.string().optional().nullable()
});
