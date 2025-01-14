import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useTableStore } from "@/store/table-store";
import { fetchActiveRatingSlips } from "@/app/actions/casino";

interface UpdateRatingSlipParams {
  ratingSlipId: string;
  newTableId: string;
  newSeatNumber: number;
}

interface UpdateDetailsParams {
  ratingSlipId: string;
  averageBet: number;
  cashIn: number;
  startTime: string;
}

export function useRatingSlips() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
  const { tables, setTables } = useTableStore();
  const supabase = createClient();

  const updateTableState = async () => {
    const activeRatingSlips = await fetchActiveRatingSlips();
    
    const updatedTables = tables.map((table) => {
      const tableRatingSlips = activeRatingSlips.filter(
        (slip) => slip.gaming_table_id === table.id
      );

      const seats = table.seats.map((_, index) => {
        const seatNumber = index + 1;
        const ratingSlip = tableRatingSlips.find(
          (slip) => slip.seat_number === seatNumber
        );
        if (ratingSlip?.visit?.player) {
          return {
            id: ratingSlip.playerId,
            firstName: ratingSlip.visit.player.firstName,
            lastName: ratingSlip.visit.player.lastName,
            email: "",
            company_id: null,
            dob: null,
            phone_number: null,
          };
        }
        return null;
      });

      return {
        ...table,
        seats,
        averageBet: tableRatingSlips.reduce(
          (sum, slip) => sum + Number(slip.average_bet),
          0
        ),
        ratingSlips: tableRatingSlips,
      };
    });

    setTables(updatedTables);
  };

  const updateRatingSlip = async ({
    ratingSlipId,
    newTableId,
    newSeatNumber,
  }: UpdateRatingSlipParams) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("ratingslip")
        .update({
          gaming_table_id: newTableId,
          seat_number: newSeatNumber,
        })
        .eq("id", ratingSlipId);

      if (error) throw error;
      await updateTableState();
    } catch (error) {
      console.error("Error updating rating slip:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateDetails = async ({
    ratingSlipId,
    averageBet,
    cashIn,
    startTime,
  }: UpdateDetailsParams) => {
    setIsUpdatingDetails(true);
    try {
      const { error } = await supabase
        .from("ratingslip")
        .update({
          average_bet: averageBet,
          cash_in: cashIn,
          start_time: startTime,
        })
        .eq("id", ratingSlipId);

      if (error) throw error;
      await updateTableState();
    } catch (error) {
      console.error("Error updating rating slip details:", error);
      throw error;
    } finally {
      setIsUpdatingDetails(false);
    }
  };

  return {
    updateRatingSlip,
    updateDetails,
    isUpdating,
    isUpdatingDetails,
  };
} 