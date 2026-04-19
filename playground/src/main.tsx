import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import '../../generated/tokens.css'
import './tailwind.css'
import './app.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)