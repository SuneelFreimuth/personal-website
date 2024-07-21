import './declarations.d'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useMatch, Outlet } from 'react-router'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import 'react-tooltip/dist/react-tooltip.css'
import 'katex/dist/katex.min.css'
import '@catppuccin/highlightjs/css/catppuccin-mocha.css'

import { Nav } from './pages/components/Nav'
import { Home } from './pages/home/Home'
import { ReadingList } from './pages/reading-list/ReadingList'

import './global.scss'


declare global {
  function assert(cond: boolean, message?: string): asserts cond;
  function unreachable(message?: string): never;
}

window.assert = (cond: boolean, message?: string) => {
  if (!cond)
    throw new Error(
      message !== undefined ?
        `Assertion failed: ${message}` :
        'Assertion failed.');
};

window.unreachable = (message='Reached unreachable statement.'): never => {
  throw new Error(message);
};


export function NavLayout() {
  return (
    <>
      <Nav/>
      <Outlet />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    element: <NavLayout/>,
    children: [
      {
        path: '/reading',
        element: <ReadingList/>,
      },
      {
        path: '/books',
        element: <ReadingList/>,
      },
    ]
  }
]);

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
