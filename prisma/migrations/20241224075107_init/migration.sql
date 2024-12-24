-- CreateTable
CREATE TABLE "casino" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "company_id" UUID,

    CONSTRAINT "casino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gamesettings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "average_rounds_per_hour" INTEGER NOT NULL,
    "house_edge" DECIMAL NOT NULL,
    "point_multiplier" DECIMAL,
    "points_conversion_rate" DECIMAL,
    "seats_available" INTEGER,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gamesettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gamingtable" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "table_number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "casino_id" UUID,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gamingtable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gamingtablesettings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_settings_id" UUID,
    "gaming_table_id" UUID,
    "active_from" TIMESTAMP(6),

    CONSTRAINT "gamingtablesettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "language" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "group_name" TEXT,

    CONSTRAINT "language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "dob" DATE,
    "company_id" UUID,

    CONSTRAINT "player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playercasino" (
    "player_id" UUID NOT NULL,
    "casino_id" UUID NOT NULL,

    CONSTRAINT "playercasino_pkey" PRIMARY KEY ("player_id","casino_id")
);

-- CreateTable
CREATE TABLE "playerlanguage" (
    "player_id" UUID NOT NULL,
    "language_id" UUID NOT NULL,

    CONSTRAINT "playerlanguage_pkey" PRIMARY KEY ("player_id","language_id")
);

-- CreateTable
CREATE TABLE "ratingslip" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "average_bet" DECIMAL NOT NULL,
    "cash_in" DECIMAL,
    "chips_brought" DECIMAL,
    "chips_taken" DECIMAL,
    "seat_number" INTEGER,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6),
    "game_settings" JSONB NOT NULL,
    "gaming_table_id" UUID,
    "visit_id" UUID,

    CONSTRAINT "ratingslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID,
    "casino_id" UUID,
    "check_in_date" TIMESTAMP(6) NOT NULL,
    "check_out_date" TIMESTAMP(6),

    CONSTRAINT "visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "player_email_key" ON "player"("email");

-- AddForeignKey
ALTER TABLE "casino" ADD CONSTRAINT "casino_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gamingtable" ADD CONSTRAINT "gamingtable_casino_id_fkey" FOREIGN KEY ("casino_id") REFERENCES "casino"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gamingtablesettings" ADD CONSTRAINT "gamingtablesettings_game_settings_id_fkey" FOREIGN KEY ("game_settings_id") REFERENCES "gamesettings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gamingtablesettings" ADD CONSTRAINT "gamingtablesettings_gaming_table_id_fkey" FOREIGN KEY ("gaming_table_id") REFERENCES "gamingtable"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "playercasino" ADD CONSTRAINT "playercasino_casino_id_fkey" FOREIGN KEY ("casino_id") REFERENCES "casino"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "playercasino" ADD CONSTRAINT "playercasino_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "playerlanguage" ADD CONSTRAINT "playerlanguage_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "playerlanguage" ADD CONSTRAINT "playerlanguage_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ratingslip" ADD CONSTRAINT "ratingslip_gaming_table_id_fkey" FOREIGN KEY ("gaming_table_id") REFERENCES "gamingtable"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ratingslip" ADD CONSTRAINT "ratingslip_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visit"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visit" ADD CONSTRAINT "visit_casino_id_fkey" FOREIGN KEY ("casino_id") REFERENCES "casino"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "visit" ADD CONSTRAINT "visit_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
