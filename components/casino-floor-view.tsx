"use client"

import React, { useState, useEffect } from 'react'
import { CasinoTable, TableData } from './casino-table'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/database.types'

type GamingTable = Database['public']['Views']['activetablesandsettings']['Row']
type RatingSlip = Database['public']['Tables']['ratingslip']['Row']

export function CasinoFloorView() {
  const [tables, setTables] = useState<GamingTable[]>([])
  const [ratingSlips, setRatingSlips] = useState<RatingSlip[]>([])
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Fetch tables
      const { data: tableData, error: tableError } = await supabase
        .from('activetablesandsettings')
        .select('*')
      
      if (tableError) {
        console.error('Error fetching tables:', tableError)
        return
      }

      // Fetch active rating slips (where end_time is null)
      const { data: slipData, error: slipError } = await supabase
        .from('ratingslip')
        .select('*')
        .is('end_time', null)

      if (slipError) {
        console.error('Error fetching rating slips:', slipError)
        return
      }

      if (tableData) setTables(tableData)
      if (slipData) setRatingSlips(slipData)
    }

    fetchData()

    // Set up real-time subscriptions
    const tableChannel = supabase
      .channel('table_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'activetablesandsettings' 
        }, 
        () => fetchData()
      )
      .subscribe()

    const ratingSlipChannel = supabase
      .channel('rating_slip_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ratingslip'
        },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(tableChannel)
      supabase.removeChannel(ratingSlipChannel)
    }
  }, [])

  const handleUpdateTable = async (updatedTable: TableData, playerId: string) => {
    // Create a new rating slip when seating a player
    const { data: visitData, error: visitError } = await supabase
      .from('visit')
      .select('id')
      .eq('player_id', playerId)
      .is('check_out_date', null)
      .single()

    if (visitError) {
      console.error('Error finding active visit:', visitError)
      return
    }
    console.log("visitData", updatedTable)
    // Create rating slip
    const { error: ratingError } = await supabase
      .from('ratingslip')
      .insert({
        gaming_table_id: updatedTable.id, // Assuming table.id is in format "tableName - settingsName"
        visit_id: visitData.id,
        start_time: new Date().toISOString(),
        average_bet: 0,
        game_settings: {} // You might want to pass the actual game settings here
      })

    if (ratingError) {
      console.error('Error creating rating slip:', ratingError)
    }
  }

  return (
    <div className="p-8 flex flex-wrap justify-center gap-4">
      {tables.map((table) => {
        const tableRatingSlips = ratingSlips.filter(
          slip => slip.gaming_table_id === table.gaming_table_id
        )
        
        return (
          <CasinoTable 
            key={table.gaming_table_id} 
            table={{
              name: `${table.table_name ?? ''} - ${table.settings_name ?? ''}`,
              id: table.gaming_table_id ?? '',
              seats: Array(table.seats_available).fill(null).map(() => null),
              averageBet: tableRatingSlips.reduce((sum, slip) => sum + slip.average_bet, 0) / (tableRatingSlips.length || 1),
              status: "active",
              hasVIP: false,
              ratingSlips: tableRatingSlips
            }} 
            selectedCasino={table.casino_id}
            onUpdateTable={handleUpdateTable} 
          />
        )
      })}
    </div>
  )
}

