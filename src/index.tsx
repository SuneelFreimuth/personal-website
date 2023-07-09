import './declarations.d'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import { App } from './App'
import { Home } from './pages/Home'
import { Blog } from './pages/Blog'

import './global.scss'

const router = createBrowserRouter([
  {
    element: <App/>,
    children: [
      {
        path: "/",
        element: <Home/>
      },
      {
        path: "/blog",
        element: <Blog/>
      },
    ]
  },
])

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
