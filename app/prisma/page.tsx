import prisma from "@/lib/prisma";

export default async function Prisma(): Promise<JSX.Element> {
  "use server";
  let players = await prisma?.player.findMany();
  return (
    <div>
      <h1>Player List</h1>
      <ul>
        {players?.map((player) => (
          <li key={player.id}>
            <strong>Name:</strong> {player.firstName} <br />
            <strong>Email:</strong> {player.email} <br />
          </li>
        ))}
      </ul>
    </div>
  );
}
