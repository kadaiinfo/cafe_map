import { useState } from 'react'
import { getCafeData } from "./lib/dataClient"
import MapView from './components/MapView/MapView.tsx'

function App() {
  const cafes = getCafeData()

  return (
    <div>
      <h1>Cafe Map</h1>
      <MapView />
    </div>
  )
}

export default App
