import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Demo user
  const passwordHash = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@staybook.io" },
    update: {},
    create: {
      email: "demo@staybook.io",
      name: "Demo User",
      passwordHash,
      bio: "Passionate traveler exploring the world one trip at a time.",
      location: "Tbilisi, Georgia",
    },
  });

  // Destinations
  const destinations = await Promise.all([
    prisma.destination.upsert({
      where: { id: "dest-paris" },
      update: {},
      create: {
        id: "dest-paris",
        name: "Paris",
        country: "France",
        countryCode: "FR",
        city: "Paris",
        description:
          "The City of Light - iconic landmarks, world-class cuisine, and art.",
        lat: 48.8566,
        lng: 2.3522,
        avgCost: 180,
        rating: 4.8,
        reviewCount: 52400,
        category: ["city", "culture", "luxury"],
        bestMonths: [4, 5, 6, 9, 10],
        isTrending: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: "dest-kyoto" },
      update: {},
      create: {
        id: "dest-kyoto",
        name: "Kyoto",
        country: "Japan",
        countryCode: "JP",
        city: "Kyoto",
        description:
          "Ancient temples, geisha districts, and breathtaking cherry blossoms.",
        lat: 35.0116,
        lng: 135.7681,
        avgCost: 120,
        rating: 4.9,
        reviewCount: 38200,
        category: ["culture", "city", "adventure"],
        bestMonths: [3, 4, 10, 11],
        isTrending: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: "dest-santorini" },
      update: {},
      create: {
        id: "dest-santorini",
        name: "Santorini",
        country: "Greece",
        countryCode: "GR",
        city: "Santorini",
        description:
          "Stunning caldera views, white-washed villages, and crystal-clear waters.",
        lat: 36.3932,
        lng: 25.4615,
        avgCost: 220,
        rating: 4.7,
        reviewCount: 29100,
        category: ["beach", "luxury", "culture"],
        bestMonths: [5, 6, 7, 8, 9],
        isTrending: true,
      },
    }),
    prisma.destination.upsert({
      where: { id: "dest-tbilisi" },
      update: {},
      create: {
        id: "dest-tbilisi",
        name: "Tbilisi",
        country: "Georgia",
        countryCode: "GE",
        city: "Tbilisi",
        description:
          "Ancient churches, sulfur baths, and one of the world's oldest wine cultures.",
        lat: 41.6938,
        lng: 44.8015,
        avgCost: 60,
        rating: 4.6,
        reviewCount: 18400,
        category: ["city", "culture", "budget"],
        bestMonths: [4, 5, 6, 9, 10],
        isTrending: false,
      },
    }),
  ]);

  // Demo trip
  const trip = await prisma.trip.upsert({
    where: { id: "trip-paris-demo" },
    update: {},
    create: {
      id: "trip-paris-demo",
      name: "Paris Romantic Getaway",
      description:
        "A week in the City of Light exploring art, food, and culture.",
      startDate: new Date("2025-06-14"),
      endDate: new Date("2025-06-21"),
      totalBudget: 3200,
      currency: "USD",
      status: "PLANNING",
      ownerId: user.id,
    },
  });

  // Add user as trip owner
  await prisma.tripMember.upsert({
    where: { tripId_userId: { tripId: trip.id, userId: user.id } },
    update: {},
    create: { tripId: trip.id, userId: user.id, role: "OWNER" },
  });

  // Link destination
  await prisma.tripDestination.upsert({
    where: {
      tripId_destinationId: { tripId: trip.id, destinationId: "dest-paris" },
    },
    update: {},
    create: { tripId: trip.id, destinationId: "dest-paris", order: 0 },
  });

  // Add days
  const day1 = await prisma.tripDay.upsert({
    where: { tripId_dayNumber: { tripId: trip.id, dayNumber: 1 } },
    update: {},
    create: {
      tripId: trip.id,
      dayNumber: 1,
      date: new Date("2025-06-14"),
      title: "Arrival & First Night",
    },
  });

  await prisma.activity.createMany({
    skipDuplicates: true,
    data: [
      {
        dayId: day1.id,
        name: "Flight CDG → Paris",
        type: "TRANSPORT",
        startTime: "09:00",
        cost: 0,
        order: 0,
      },
      {
        dayId: day1.id,
        name: "Check-in: Hôtel Lutetia",
        type: "HOTEL",
        startTime: "12:30",
        cost: 420,
        address: "45 Blvd Raspail, Paris",
        order: 1,
      },
      {
        dayId: day1.id,
        name: "Notre-Dame Cathedral",
        type: "SIGHT",
        startTime: "15:00",
        cost: 0,
        lat: 48.853,
        lng: 2.3499,
        order: 2,
      },
      {
        dayId: day1.id,
        name: "Dinner: Le Procope",
        type: "FOOD",
        startTime: "19:30",
        cost: 85,
        order: 3,
      },
    ],
  });

  // Sample expenses
  await prisma.expense.createMany({
    skipDuplicates: true,
    data: [
      {
        tripId: trip.id,
        paidById: user.id,
        description: "Hôtel Lutetia",
        amount: 420,
        category: "HOTEL",
        date: new Date("2025-06-14"),
      },
      {
        tripId: trip.id,
        paidById: user.id,
        description: "Le Procope dinner",
        amount: 85,
        category: "FOOD",
        date: new Date("2025-06-14"),
      },
      {
        tripId: trip.id,
        paidById: user.id,
        description: "Louvre Museum tickets",
        amount: 65,
        category: "ACTIVITIES",
        date: new Date("2025-06-15"),
      },
      {
        tripId: trip.id,
        paidById: user.id,
        description: "Metro day pass",
        amount: 14,
        category: "TRANSPORT",
        date: new Date("2025-06-15"),
      },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("   Demo login: demo@staybook.io / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
