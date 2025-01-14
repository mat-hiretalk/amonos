"use client";

import { useEffect, useState } from "react";
import { Bell, History, Menu, Search, User, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerSearchModal } from "@/components/player-search-modal";
import { CasinoSelector } from "@/components/casino-selector";
import { createClient } from "@/utils/supabase/client";
import { CasinoFloorView } from "./casino-floor-view";
import { AddPlayerModal } from "@/components/add-player-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCasinoStore } from "@/store/casino-store";

interface Visit {
  id: string;
  player_id: string;
  check_in_date: string;
  check_out_date: string | null;
  player: {
    firstName: string;
  };
}

const getElapsedTime = (startTime: string) => {
  const start = new Date(startTime);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60)); // minutes
  return diff < 60 ? `${diff}m` : `${Math.floor(diff / 60)}h ${diff % 60}m`;
};

export default function PitStation() {
  const { selectedCasino } = useCasinoStore();
  const [activeVisits, setActiveVisits] = useState<Visit[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!selectedCasino) return;

    const fetchActiveVisits = async () => {
      const { data, error } = await supabase
        .from("visit")
        .select(
          `
          id,
          player_id,
          check_in_date,
          check_out_date,
          player:player!player_id(firstName)
        `
        )
        .eq("casino_id", selectedCasino)
        .is("check_out_date", null)
        .order("check_in_date", { ascending: false });

      if (error) {
        console.error("Error fetching visits:", error);
        return;
      }

      if (!data) return;

      const formattedData: Visit[] = data
        .filter((visit) => visit.player_id !== null)
        .map((visit) => ({
          id: visit.id,
          player_id: visit.player_id!,
          check_in_date: visit.check_in_date,
          check_out_date: visit.check_out_date,
          player: {
            firstName: Array.isArray(visit.player)
              ? visit.player[0]?.firstName || ""
              : visit.player?.firstName || "",
          },
        }));

      setActiveVisits(formattedData);
    };

    fetchActiveVisits();

    const channel = supabase
      .channel("visits_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "visits",
          filter: `casino_id=eq.${selectedCasino}`,
        },
        () => {
          fetchActiveVisits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCasino]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <header className="border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Pit Station Menu</SheetTitle>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <Button variant="ghost" className="justify-start">
                      Main Menu
                    </Button>
                    <Button variant="ghost" className="justify-start">
                      All Tables
                    </Button>
                    <Button variant="ghost" className="justify-start">
                      Find Player
                    </Button>
                    <Button variant="ghost" className="justify-start">
                      Issue Reward
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-red-500"
                    >
                      Log Out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-bold">Pit Station</h1>
            </div>
            <div className="flex items-center gap-4">
              <CasinoSelector />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <UserCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Search Players
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Search Players</DialogTitle>
                </DialogHeader>
                <PlayerSearchModal />
              </DialogContent>
            </Dialog>
            {selectedCasino && (
              <AddPlayerModal selectedCasino={selectedCasino} />
            )}
          </div>
        </header>

        <div className="flex-1 p-4">
          <Tabs defaultValue="floor" className="h-full space-y-6">
            <div className="space-between flex items-center">
              <TabsList>
                <TabsTrigger value="floor">Floor View</TabsTrigger>
                <TabsTrigger value="active" className="relative">
                  Active Players
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="floor">
              {selectedCasino ? (
                <CasinoFloorView casinoId={selectedCasino} />
              ) : (
                <div className="text-center py-4">
                  Please select a casino first
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="border-none p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Check-in Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeVisits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>{visit.player.firstName}</TableCell>
                      <TableCell>
                        {new Date(visit.check_in_date).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getElapsedTime(visit.check_in_date)}
                      </TableCell>
                      <TableCell>
                        <span className="text-green-500">Active</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <History className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <User className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
