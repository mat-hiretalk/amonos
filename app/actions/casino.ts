'use server'

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type TableWithSettings = {
  gaming_table_id: string;
  casino_id: string;
  table_name: string;
  settings_name: string;
  seats_available: number;
};

export type RatingSlipWithPlayer = {
  id: string;
  gaming_table_id: string | null;
  visit_id: string | null;
  average_bet: number;
  cash_in: number | null;
  chips_brought: number | null;
  chips_taken: number | null;
  seat_number: number | null;
  start_time: string;
  end_time: string | null;
  game_settings: Prisma.JsonValue;
  playerName: string;
  playerId: string;
};

export async function fetchCasinoTables(casinoId: string) {
  try {
    const tables = await prisma.gamingtable.findMany({
      where: {
        casino_id: casinoId,
      },
      select: {
        id: true,
        casino_id: true,
        name: true,
        gamingtablesettings: {
          select: {
            gamesettings: {
              select: {
                name: true,
                seats_available: true,
              },
            },
          },
        },
      },
    });

    return tables.map((table) => ({
      gaming_table_id: table.id,
      casino_id: table.casino_id!,
      table_name: table.name,
      settings_name: table.gamingtablesettings[0]?.gamesettings?.name || "",
      seats_available: table.gamingtablesettings[0]?.gamesettings?.seats_available || 0,
    }));
  } catch (error) {
    console.error("Error fetching casino tables:", error);
    throw error;
  }
}

export async function fetchActiveRatingSlips() {
  try {
    console.log("Fetching active rating slips...");
    const ratingSlips = await prisma.ratingslip.findMany({
      where: {
        end_time: null,
      },
      include: {
        visit: {
          include: {
            player: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        player: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log("Raw rating slips from DB:", JSON.stringify(ratingSlips, null, 2));

    const serializedSlips = ratingSlips.map((slip) => ({
      id: slip.id,
      gaming_table_id: slip.gaming_table_id,
      visit_id: slip.visit_id,
      average_bet: Number(slip.average_bet.toString()),
      cash_in: slip.cash_in ? Number(slip.cash_in.toString()) : null,
      chips_brought: slip.chips_brought ? Number(slip.chips_brought.toString()) : null,
      chips_taken: slip.chips_taken ? Number(slip.chips_taken.toString()) : null,
      seat_number: slip.seat_number,
      start_time: slip.start_time.toISOString(),
      end_time: slip.end_time?.toISOString() || null,
      game_settings: slip.game_settings,
      playerName: slip.player ? `${slip.player.firstName} ${slip.player.lastName}` : 
                 (slip.visit?.player ? `${slip.visit.player.firstName} ${slip.visit.player.lastName}` : "Unknown Player"),
      playerId: slip.playerId,
      visit: {
        player: slip.visit?.player || slip.player
      }
    }));

    console.log("Serialized rating slips:", JSON.stringify(serializedSlips, null, 2));
    return serializedSlips;
  } catch (error) {
    console.error("Error fetching active rating slips:", error);
    throw error;
  }
}

export async function updateTableCasinoId(tableId: string, casinoId: string) {
  try {
    const updatedTable = await prisma.gamingtable.update({
      where: { id: tableId },
      data: { casino_id: casinoId },
    });
    return updatedTable;
  } catch (error) {
    console.error("Error updating table casino ID:", error);
    throw error;
  }
}
//Move Player action
export async function movePlayer(ratingSlipId: string, newTableId: string, newSeatNumber: number) {
  try {
    const updatedRatingSlip = await prisma.ratingslip.update({
      where: { id: ratingSlipId },
      data: {
        gaming_table_id: newTableId,
        seat_number: newSeatNumber,
      },
      include: {
        visit: {
          include: {
            player: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        player: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Serialize the response data
    return {
      id: updatedRatingSlip.id,
      gaming_table_id: updatedRatingSlip.gaming_table_id,
      visit_id: updatedRatingSlip.visit_id,
      average_bet: Number(updatedRatingSlip.average_bet.toString()),
      cash_in: updatedRatingSlip.cash_in ? Number(updatedRatingSlip.cash_in.toString()) : null,
      chips_brought: updatedRatingSlip.chips_brought ? Number(updatedRatingSlip.chips_brought.toString()) : null,
      chips_taken: updatedRatingSlip.chips_taken ? Number(updatedRatingSlip.chips_taken.toString()) : null,
      seat_number: updatedRatingSlip.seat_number,
      start_time: updatedRatingSlip.start_time.toISOString(),
      end_time: updatedRatingSlip.end_time?.toISOString() || null,
      game_settings: updatedRatingSlip.game_settings,
      visit: {
        player: updatedRatingSlip.visit?.player || updatedRatingSlip.player
      }
    };
  } catch (error) {
    console.error("Error moving player:", error);
    throw error;
  }
}

export async function createRatingSlip(
  tableId: string,
  playerId: string,
  seatNumber: number,
  casinoId: string
) {
  try {
    return await prisma.$transaction(async (tx) => {
      // First check if player has an active rating slip
      const existingRatingSlip = await tx.ratingslip.findFirst({
        where: {
          playerId: playerId,
          end_time: null,
        },
      });

      if (existingRatingSlip) {
        // If there's an existing slip, end it before creating a new one
        await tx.ratingslip.update({
          where: {
            id: existingRatingSlip.id,
          },
          data: {
            end_time: new Date(),
          },
        });
      }

      // Find or create active visit
      let activeVisit = await tx.visit.findFirst({
        where: {
          player_id: playerId,
          check_out_date: null,
        },
        select: {
          id: true,
        },
      });

      if (!activeVisit) {
        console.log("No active visit found, looking up table:", tableId);
        // Get the casino ID from the gaming table
        let table = await tx.gamingtable.findUnique({
          where: { id: tableId },
        });

        console.log("Found table:", table);

        if (!table) {
          throw new Error(`Table not found with ID: ${tableId}`);
        }

        // If table has no casino_id, update it
        if (!table.casino_id) {
          console.log("Table has no casino_id, updating with provided casino ID");
          table = await tx.gamingtable.update({
            where: { id: tableId },
            data: { casino_id: casinoId },
          });
        }

        // Create a new visit
        activeVisit = await tx.visit.create({
          data: {
            player_id: playerId,
            casino_id: table.casino_id!,
            check_in_date: new Date(),
          },
          select: {
            id: true,
          },
        });
      }

      // Create new rating slip
      const ratingSlip = await tx.ratingslip.create({
        data: {
          gaming_table_id: tableId,
          visit_id: activeVisit.id,
          start_time: new Date(),
          average_bet: 0,
          seat_number: seatNumber,
          game_settings: {},
          playerId: playerId,
        },
        include: {
          gamingtable: true,
          visit: {
            include: {
              player: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      // Serialize the response data
      return {
        id: ratingSlip.id,
        gaming_table_id: ratingSlip.gaming_table_id,
        visit_id: ratingSlip.visit_id,
        average_bet: Number(ratingSlip.average_bet.toString()),
        cash_in: ratingSlip.cash_in ? Number(ratingSlip.cash_in.toString()) : null,
        chips_brought: ratingSlip.chips_brought ? Number(ratingSlip.chips_brought.toString()) : null,
        chips_taken: ratingSlip.chips_taken ? Number(ratingSlip.chips_taken.toString()) : null,
        seat_number: ratingSlip.seat_number,
        start_time: ratingSlip.start_time.toISOString(),
        end_time: ratingSlip.end_time?.toISOString() || null,
        game_settings: ratingSlip.game_settings,
        playerName: `${ratingSlip.visit?.player?.firstName || ""} ${ratingSlip.visit?.player?.lastName || ""}`.trim(),
        playerId: ratingSlip.playerId,
      };
    });
  } catch (error) {
    console.error("Error creating rating slip:", error);
    throw error;
  }
 
} 

export async function updateRatingSlipDetails(
  ratingSlipId: string,
  {
    averageBet,
    cashIn,
    startTime,
  }: {
    averageBet: number;
    cashIn: number;
    startTime: string;
  }
) {
  const updatedSlip = await prisma.ratingslip.update({
    where: {
      id: ratingSlipId,
    },
    data: {
      average_bet: averageBet,
      cash_in: cashIn,
      start_time: startTime,
    },
    include: {
      visit: {
        include: {
          player: true,
        },
      },
    },
  });

  return {
    ...updatedSlip,
    average_bet: Number(updatedSlip.average_bet.toString()),
    cash_in: updatedSlip.cash_in ? Number(updatedSlip.cash_in.toString()) : null,
    chips_brought: updatedSlip.chips_brought ? Number(updatedSlip.chips_brought.toString()) : null,
    chips_taken: updatedSlip.chips_taken ? Number(updatedSlip.chips_taken.toString()) : null,
    start_time: updatedSlip.start_time.toISOString(),
    end_time: updatedSlip.end_time?.toISOString() || null,
  };
} 