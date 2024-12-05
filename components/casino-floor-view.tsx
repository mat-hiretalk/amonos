"use client"

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CasinoTable, TableData } from './casino-table'

interface GamingTable {
  gaming_table_id: string
  table_name: string
  table_description: string
  casino_id: string
  game_settings_id: string
  settings_name: string
  version: string
  house_edge: number
  average_rounds_per_hour: number
  point_multiplier: number
  points_conversion_rate: number
  active_from: string
}

export function CasinoFloorView() {
  const [tables, setTables] = useState<GamingTable[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchTables() {
      const { data, error } = await supabase
        .from('activetablesandsettings')
        .select('*')
      
      if (error) {
        console.error('Error fetching tables:', error)
        return
      }

      if (data) {
        setTables(data)
      }
    }

    fetchTables()

    // Set up real-time subscription
    const channel = supabase
      .channel('table_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'activetablesandsettings' 
        }, 
        (payload) => {
          fetchTables()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleUpdateTable = (updatedTable: TableData) => {
    // Here you would implement the logic to update the table in your database
    console.log('Table updated:', updatedTable)
  }

  return (
    <div className="p-8 flex flex-wrap justify-center gap-4">
      {tables.map((table) => (
        <CasinoTable 
          key={table.gaming_table_id} 
          table={{
            id: `${table.table_name} - ${table.settings_name}`,
            seats: new Array(6).fill(null), // Initialize with 6 empty seats
            averageBet: 0, // This would need to come from a different table/view
            status: "active",
            hasVIP: false // This would need to come from a different table/view
          }} 
          onUpdateTable={handleUpdateTable} 
        />
      ))}
    </div>
  )
}

