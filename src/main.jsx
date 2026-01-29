import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

window.GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)