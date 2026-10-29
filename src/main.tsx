import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

/**
 * GitHub project pages host this build under /S.A.C.O.D.E/, while a custom
 * domain (and the dev server) serve it from the root. Mirroring the base tag
 * set in index.html keeps the router's idea of "/" correct in both cases.
 */
const MOUNT = /^\/S\.A\.C\.O\.D\.E(?=\/|$)/i
const basename = window.location.pathname.match(MOUNT)?.[0] ?? '/'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
