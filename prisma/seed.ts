import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getPlayers = (): Prisma.playerCreateInput[] => {
  return [
    {
      firstName: "John",
      email: "john@example.com",
      lastName: "Doe",
    },
    {
      firstName: "Jane Smith",
      email: "jane@example.com",
      lastName: "Smith",
    },
    {
      firstName: "Mike Johnson",
      email: "mike@example.com",
      lastName: "Johnson",
    },
  ];
};

const seedPlayers = async () => {
  try {
    // Clear existing players
    await prisma.player.deleteMany();
    console.log("Deleted existing players");

    // Add new players
    const players = getPlayers();
    for (const player of players) {
      await prisma.player.create({
        data: player,
      });
    }
    console.log(`Added ${players.length} players`);

    // Retrieve and display all players
    const allPlayers = await prisma.player.findMany();
    console.log("Current players in database:", allPlayers);
  } catch (error) {
    console.error("Error seeding players:", error);
    throw error;
  }
};

const main = async () => {
  try {
    await seedPlayers();
  } catch (error) {
    console.error("Error in seed script:", error);
    process.exit(1);
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    console.log("Prisma disconnected");
    process.exit(1);
  });
