import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {JigContextProvider} from './Context/JigContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <JigContextProvider>
      <App />
    </JigContextProvider>
  </StrictMode>,
)
