import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function Prisma(): Promise<JSX.Element> {
  "use server";
  let players = await prisma.player.findMany();
  return (
    <div>
      <h1>Player List</h1>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            <strong>Name:</strong> {player.name} <br />
            
          </li>
        ))}
      </ul>
    </div>
  );
}
