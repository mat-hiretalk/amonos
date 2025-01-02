import prisma from "@/lib/prisma";
import Database from '@/database.types'
export default async function Prisma(): Promise<JSX.Element> {
  "use server";
  let players = await prisma?.player.findMany();
  let casinos = await prisma?.casino.findMany();
  let ratingSlips = await prisma?.ratingslip.findMany({
    include: {
      player: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  console.log("Rating slips", ratingSlips);

  return (
    <div>
      <h1 className="underline">Player List</h1>
      <ul>
        {players?.map((player) => (
          <li key={player.id}>
            <strong className="text-sky-400/50 underline-offset-2">
              Name:
            </strong>{" "}
            {player.firstName} <br />
            <strong className="text-orange-400">Last Name:</strong>{" "}
            {player.lastName} <br />
            <strong>Email:</strong> {player.ratingslipId} <br />
          </li>
        ))}
      </ul>
      <ul>
        {casinos.map((casino) => (
          <li key={casino.company_id}>
            <strong> Casino Name: {casino.name}</strong>
          </li>
        ))}
      </ul>
      <ul>
        {ratingSlips.map((slip) => (
          <li key={slip.id}>
            <strong> Player Name From the slip': {slip.player?.firstName}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
