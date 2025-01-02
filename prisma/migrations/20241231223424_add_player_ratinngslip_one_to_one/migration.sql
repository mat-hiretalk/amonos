/*
  Warnings:

  - A unique constraint covering the columns `[ratingslipId]` on the table `player` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[playerId]` on the table `ratingslip` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `playerId` to the `ratingslip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "player" ADD COLUMN     "ratingslipId" UUID;

-- AlterTable
ALTER TABLE "ratingslip" ADD COLUMN     "playerId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "player_ratingslipId_key" ON "player"("ratingslipId");

-- CreateIndex
CREATE UNIQUE INDEX "ratingslip_playerId_key" ON "ratingslip"("playerId");

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_ratingslipId_fkey" FOREIGN KEY ("ratingslipId") REFERENCES "ratingslip"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
