/*
  Warnings:

  - You are about to drop the column `ratingslipId` on the `player` table. All the data in the column will be lost.
  - The primary key for the `ratingslip` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[playerId,end_time]` on the table `ratingslip` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "player" DROP CONSTRAINT "player_ratingslipId_fkey";

-- DropForeignKey
ALTER TABLE "ratingslip" DROP CONSTRAINT "ratingslip_visit_id_fkey";

-- DropIndex
DROP INDEX "player_ratingslipId_key";

-- DropIndex
DROP INDEX "ratingslip_playerId_key";

-- AlterTable
ALTER TABLE "player" DROP COLUMN "ratingslipId";

-- AlterTable
ALTER TABLE "ratingslip" DROP CONSTRAINT "ratingslip_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ratingslip_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "ratingslip_playerId_end_time_key" ON "ratingslip"("playerId", "end_time");

-- AddForeignKey
ALTER TABLE "ratingslip" ADD CONSTRAINT "ratingslip_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratingslip" ADD CONSTRAINT "ratingslip_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
