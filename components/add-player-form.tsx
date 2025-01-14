"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePlayerStore } from "@/store/player-store";
import { useTableStore } from "@/store/table-store";
import { fetchActiveRatingSlips } from "@/app/actions/casino";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
}

export function AddPlayerForm({ selectedCasino }: { selectedCasino: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dob: "",
  });
  const { toast } = useToast();
  const { setPlayers } = usePlayerStore();
  const { tables, setTables } = useTableStore();
  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateTableState = async () => {
    try {
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

          if (!ratingSlip?.visit?.player) {
            return null;
          }

          return {
            id: ratingSlip.playerId,
            firstName: ratingSlip.visit.player.firstName,
            lastName: ratingSlip.visit.player.lastName,
            email: "",
            company_id: null,
            dob: null,
            phone_number: null,
          };
        });

        const ratingSlipsMap = new Map();
        tableRatingSlips.forEach((slip) => {
          if (slip.seat_number) {
            ratingSlipsMap.set(slip.seat_number, {
              ...slip,
              visit: {
                ...slip.visit,
                player: seats[slip.seat_number - 1],
              },
            });
          }
        });

        const mappedRatingSlips = Array.from(ratingSlipsMap.values());

        return {
          ...table,
          seats,
          averageBet: mappedRatingSlips.reduce(
            (sum, slip) => sum + Number(slip.average_bet),
            0
          ),
          ratingSlips: mappedRatingSlips,
        };
      });

      setTables(updatedTables);
    } catch (error) {
      console.error("Error updating table state:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Insert player
      const { data: playerData, error: playerError } = await supabase
        .from("player")
        .insert({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone_number: formData.phoneNumber,
          dob: formData.dob || null,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      // Link player to casino
      if (selectedCasino && playerData) {
        const { error: casinoError } = await supabase
          .from("playercasino")
          .insert({
            player_id: playerData.id,
            casino_id: selectedCasino,
          });

        if (casinoError) throw casinoError;

        // Fetch updated players list
        const { data: updatedPlayers, error: playersError } = await supabase
          .from("player")
          .select("*")
          .order("firstName");

        if (playersError) throw playersError;

        // Update players in store
        setPlayers(updatedPlayers);

        // Update table state to reflect any changes
        await updateTableState();
      }

      toast({
        title: "Success",
        description: "Player added successfully",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        dob: "",
      });
    } catch (error) {
      console.error("Error adding player:", error);
      toast({
        title: "Error",
        description: "Failed to add player. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    //TODO: add validation. Use Formik perhaps
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name *</Label>
        <Input
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          required
          placeholder="Enter first name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name *</Label>
        <Input
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          required
          placeholder="Enter last name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          placeholder="Enter email address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="Enter phone number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dob">Date of Birth</Label>
        <Input
          id="dob"
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleInputChange}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Player"}
      </Button>
    </form>
  );
}
