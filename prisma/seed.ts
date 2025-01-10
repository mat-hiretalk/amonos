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
      firstName: "Jane",
      email: "jane@example.com",
      lastName: "Smith",
    },
    {
      firstName: "Mike",
      email: "mike@example.com",
      lastName: "Johnson",
    },
  ];
};

const getGameSettings = (): Prisma.gamesettingsCreateInput[] => {
  return [
    {
      name: "Blackjack Standard",
      average_rounds_per_hour: 60,
      house_edge: new Prisma.Decimal(0.5),
      point_multiplier: new Prisma.Decimal(1.0),
      points_conversion_rate: new Prisma.Decimal(100),
      seats_available: 7,
      version: 1,
    },
    {
      name: "Roulette Standard",
      average_rounds_per_hour: 40,
      house_edge: new Prisma.Decimal(5.26),
      point_multiplier: new Prisma.Decimal(1.0),
      points_conversion_rate: new Prisma.Decimal(100),
      seats_available: 8,
      version: 1,
    },
  ];
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await prisma.ratingslip.deleteMany();
    await prisma.gamingtablesettings.deleteMany();
    await prisma.gamingtable.deleteMany();
    await prisma.gamesettings.deleteMany();
    await prisma.playercasino.deleteMany();
    await prisma.player.deleteMany();
    await prisma.casino.deleteMany();
    console.log("Cleared existing data");

    // Create casino
    const casino = await prisma.casino.create({
      data: {
        name: "Golden Palace",
        location: "Las Vegas",
      },
    });
    console.log("Created casino:", casino.name);

    // Add game settings
    const gameSettings = await Promise.all(
      getGameSettings().map((settings) =>
        prisma.gamesettings.create({
          data: settings,
        })
      )
    );
    console.log(`Added ${gameSettings.length} game settings`);

    // Create gaming tables
    const tables = await Promise.all([
      prisma.gamingtable.create({
        data: {
          name: "High Roller Blackjack",
          description: "Premium blackjack table for high stakes players",
          table_number: "BJ-1",
          type: "blackjack",
          casino_id: casino.id,
          gamingtablesettings: {
            create: {
              game_settings_id: gameSettings[0].id,
              active_from: new Date(),
            },
          },
        },
      }),
      prisma.gamingtable.create({
        data: {
          name: "Classic Roulette",
          description: "Traditional European roulette",
          table_number: "R-1",
          type: "roulette",
          casino_id: casino.id,
          gamingtablesettings: {
            create: {
              game_settings_id: gameSettings[1].id,
              active_from: new Date(),
            },
          },
        },
      }),
    ]);
    console.log(`Created ${tables.length} gaming tables`);

    // Add players
    const players = await Promise.all(
      getPlayers().map((player) =>
        prisma.player.create({
          data: {
            ...player,
            playercasino: {
              create: {
                casino_id: casino.id,
              },
            },
          },
        })
      )
    );
    console.log(`Added ${players.length} players`);

    // Create a visit and rating slip for one player
    const visit = await prisma.visit.create({
      data: {
        player_id: players[0].id,
        casino_id: casino.id,
        check_in_date: new Date(),
        ratingslips: {
          create: {
            gaming_table_id: tables[0].id,
            average_bet: new Prisma.Decimal(100),
            cash_in: new Prisma.Decimal(1000),
            seat_number: 1,
            start_time: new Date(),
            game_settings: {},
            playerId: players[0].id,
          },
        },
      },
    });
    console.log("Created visit and rating slip for", players[0].firstName);

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

const main = async () => {
  try {
    await seedDatabase();
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
    process.exit(1);
  });
