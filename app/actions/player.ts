'use server'

import prisma from "@/lib/prisma";

export async function searchPlayers(searchTerm: string) {
  try {
    const players = await prisma.player.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phone_number: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        ratingslip: true,
      },
      take: 10,
    });

    return players.map((player) => ({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.email,
      phone_number: player.phone_number,
      dob: player.dob?.toISOString() || null,
      company_id: player.company_id,
      ratingslipId: player.ratingslip?.id || null,
    }));
  } catch (error) {
    console.error("Error searching players:", error);
    throw error;
  }
} 