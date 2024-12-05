"use client"

import React, { useState, useEffect } from 'react'
import { CasinoTable, TableData } from './casino-table'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/database.types'

type GamingTable = Database['public']['Tables']['activetablesandsettings']['Row']

export function CasinoFloorView() {
  const [tables, setTables] = useState<GamingTable[]>([])
  const supabase =  createClient();

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
            seats: new Array(table.seats_available).fill(null), // Initialize with 6 empty seats
            averageBet: 0, // This would need to come from a different table/view
            status: "active",
            hasVIP: false // This would need to come from a different table/view
          }} 
          selectedCasino={table.casino_id}
          onUpdateTable={handleUpdateTable} 
        />
      ))}
    </div>
  )
}

