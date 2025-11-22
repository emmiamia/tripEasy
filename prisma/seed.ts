import { PrismaClient } from "@prisma/client";
import { addDays, addHours, parseISO } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: "seed@example.com",
      name: "Seed User"
    }
  });

  const startDate = parseISO("2025-03-15");

  const trip = await prisma.trip.create({
    data: {
      name: "Japan Spring Explorer",
      destination: "Tokyo, Kyoto & Osaka",
      startDate,
      endDate: addDays(startDate, 9),
      travelStyle: "CULTURE",
      currency: "JPY",
      description: "Cherry blossom adventure through Japan's cultural capitals.",
      coverImage:
        "https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=1200&q=80",
      createdById: user.id,
      companions: {
        create: [
          { name: "Alex Johnson", email: "alex@example.com" },
          { name: "Priya Singh", email: "priya@example.com" }
        ]
      },
      packingItems: {
        create: [
          { name: "Passport", category: "Essentials", quantity: 1, isPacked: true },
          { name: "Camera", category: "Electronics", quantity: 1 },
          { name: "Light Jacket", category: "Clothing", quantity: 1 }
        ]
      },
      tasks: {
        create: [
          { title: "Confirm JR Pass", dueDate: addDays(startDate, -14) },
          { title: "Reserve tea ceremony", dueDate: addDays(startDate, -7), isComplete: true }
        ]
      },
      expenses: {
        create: [
          {
            description: "Flight to Tokyo",
            amount: 1100,
            currency: "USD",
            date: addDays(startDate, -1),
            category: "TRANSPORT",
            paidBy: "Alex"
          },
          {
            description: "Airbnb Kyoto",
            amount: 82000,
            currency: "JPY",
            date: addDays(startDate, 3),
            category: "LODGING",
            paidBy: "Priya"
          }
        ]
      },
      notes: {
        create: [
          { content: "Check sakura forecast one week before departure." },
          { content: "Buy Suica card upon arrival at Haneda." }
        ]
      },
      days: {
        create: Array.from({ length: 6 }).map((_, idx) => ({
          date: addDays(startDate, idx),
          summary: idx === 0 ? "Arrival and explore Shinjuku" : undefined,
          activities: {
            create: [
              {
                title: idx === 2 ? "Fushimi Inari Shrine" : "City Exploration",
                subtitle: idx === 0 ? "Check-in & ramen" : undefined,
                startTime: addHours(addDays(startDate, idx), 9),
                endTime: addHours(addDays(startDate, idx), 12),
                locationName: idx === 2 ? "Kyoto" : "Tokyo",
                locationLat: idx === 2 ? 34.9671 : 35.6938,
                locationLng: idx === 2 ? 135.7727 : 139.7035,
                category: idx === 2 ? "SIGHTSEEING" : "FOOD",
                notes: idx === 0 ? "Try Ichiran" : undefined
              },
              {
                title: idx === 4 ? "Osaka Nightlife" : "Local Experience",
                startTime: addHours(addDays(startDate, idx), 14),
                endTime: addHours(addDays(startDate, idx), 18),
                locationName: idx >= 4 ? "Osaka" : "Tokyo",
                locationLat: idx >= 4 ? 34.6937 : 35.6762,
                locationLng: idx >= 4 ? 135.5023 : 139.6503,
                category: "OTHER"
              }
            ]
          }
        }))
      },
      lodgings: {
        create: [
          {
            name: "Shinjuku Granbell Hotel",
            address: "2 Chome-14-5 Kabukicho, Tokyo",
            checkIn: startDate,
            checkOut: addDays(startDate, 3),
            confirmationNumber: "SGH-12345"
          },
          {
            name: "Ryokan Yachiyo",
            address: "34 Nanzenji-Fukuchi-cho, Kyoto",
            checkIn: addDays(startDate, 3),
            checkOut: addDays(startDate, 6),
            confirmationNumber: "RYK-67890"
          }
        ]
      },
      segments: {
        create: [
          {
            type: "FLIGHT",
            carrier: "ANA",
            departureCity: "San Francisco",
            arrivalCity: "Tokyo",
            departureTime: addDays(startDate, -1),
            arrivalTime: startDate,
            seat: "12A"
          },
          {
            type: "TRAIN",
            carrier: "Shinkansen",
            departureCity: "Tokyo",
            arrivalCity: "Kyoto",
            departureTime: addDays(startDate, 3),
            arrivalTime: addHours(addDays(startDate, 3), 3)
          }
        ]
      }
    }
  });

  console.log(`Seeded trip ${trip.name}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
