import { Database } from "@/database.types";

// Defining an interface for the GameSettings type
export interface GameSettings {
  houseEdge: number; // House edge percentage (e.g., 5.55 for 5.55%)
  averageRoundsPerHour: number; // Average number of rounds played per hour
  pointMultiplier?: number; // Optional multiplier for points (default is 1.0)
  pointsConversionRate?: number; // Points conversion rate (e.g., 10 points per $100)
  seatsAvailable?: number; // Number of seats available at the game table
}

// Function to calculate points earned
export function calculatePoints(
  gameSettings: GameSettings,
  averageBet: number, // Average bet per round ($)
  start_time: string, // Duration of play in minutes
  end_time: string // Duration of play in minutes
): number {
  const duration =
    new Date(end_time).getTime() - new Date(start_time).getTime();
  const durationInMinutes = Math.floor(duration / (1000 * 60));
  // Destructure the game settings and set default values
  console.log("gameSettings", gameSettings);
  const {
    houseEdge,
    averageRoundsPerHour,
    pointMultiplier = 1.0,
    pointsConversionRate = 10.0,
    seatsAvailable = 7,
  } = gameSettings;

  // Calculate the total rounds based on the duration of play
  const totalRounds = (averageRoundsPerHour / 60) * durationInMinutes;

  // Calculate the theoretical win using house edge
  const theoreticalWin = averageBet * (houseEdge / 100) * totalRounds;

  // Calculate points earned based on the theoretical win, points conversion rate, and multiplier
  let pointsEarned = theoreticalWin * pointsConversionRate * pointMultiplier;

  // Additional logic considering the number of seats available
  // if (seatsAvailable < 7) {
  //   pointsEarned *= 1 + (7 - seatsAvailable) * 0.05; // 5% bonus per empty seat
  // }

  // Return the calculated points, rounded to the nearest integer
  // Add step-by-step debugging
  console.log({
    step1_totalRounds: {
      calculation: `(${averageRoundsPerHour} / 60) * ${durationInMinutes}`,
      result: totalRounds,
    },
    step2_theoreticalWin: {
      calculation: `$${averageBet} * (${houseEdge}/100) * ${totalRounds}`,
      result: theoreticalWin,
    },
    step3_points: {
      calculation: `${theoreticalWin} * ${pointsConversionRate} * ${pointMultiplier}`,
      result: pointsEarned,
    },
    finalPoints: Math.round(pointsEarned),
  });
  return Math.round(pointsEarned);
}

export type ActiveTableSettings =
  Database["public"]["Views"]["activetablesandsettings"]["Row"];

export function activeTableSettingsToGameSettings(
  activeTableSettings: ActiveTableSettings
): GameSettings {
  const gameSettings: GameSettings = {
    houseEdge: activeTableSettings.house_edge ?? 0,
    averageRoundsPerHour: activeTableSettings.average_rounds_per_hour ?? 0,
    pointMultiplier: activeTableSettings.point_multiplier ?? 0,
    pointsConversionRate: activeTableSettings.points_conversion_rate ?? 0,
    seatsAvailable: activeTableSettings.seats_available ?? 0,
  };
  return gameSettings;
}

// // Example usage of the function
// const gameSettings: GameSettings = {
//   id: "a1b2c3d4",
//   name: "Baccarat",
//   version: 1,
//   houseEdge: 5.55, // House edge percentage for the game
//   averageRoundsPerHour: 60, // Average number of rounds played per hour
//   pointMultiplier: 1.5, // Optional multiplier during promotions
//   pointsConversionRate: 10.0, // Points per $100 of theoretical win
//   seatsAvailable: 5, // Number of seats available at the game table
//   createdAt: new Date(), // Creation timestamp
//   updatedAt: new Date(), // Last updated timestamp
// };

// const averageBet = 25; // $25 average bet per round
// const totalRounds = 100; // Number of rounds played

// const points = calculatePoints(gameSettings, averageBet, totalRounds);
// console.log(`Points Earned: ${points}`);
