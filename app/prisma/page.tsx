import prisma from "@/lib/prisma";
import { Database } from "@/database.types";
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
            <strong>Name: {player.firstName}</strong>
            <p>Email: {player.email}</p>
            <p>Phone: {player.phone_number}</p>
            <p>DOB: {player.dob?.toString()}</p>
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
            <strong>
              {" "}
              Player Name From the slip': {slip.player?.firstName}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
