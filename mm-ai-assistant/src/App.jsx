import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AssistantPage from './pages/AssistantPage'
import './App.scss'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AssistantPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

