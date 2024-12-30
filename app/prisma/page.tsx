import prisma from "@/lib/prisma";

export default async function Prisma(): Promise<JSX.Element> {
  "use server";
  let players = await prisma?.player.findMany();
  let casinos = await prisma?.casino.findMany()
  return (
    <div>
      <h1 className='underline'>Player List</h1>
      <ul>
        {players?.map((player) => (
          <li key={player.id}>
            <strong className='text-sky-400/50 underline-offset-2'>Name:</strong> {player.firstName} <br />
            <strong className="text-orange-400">Last Name:</strong> {player.lastName} <br />
            <strong>Email:</strong> {player.email} <br />
          </li>
        ))}
      </ul>
      <ul>
        {casinos.map((casino) => (
          <li key={casino.company_id}>
            <strong> Casino Name: {casino.name}</strong>
          </li>
        ) )}
      </ul>
    </div>
  );
}
