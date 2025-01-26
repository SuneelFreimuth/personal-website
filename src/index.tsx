import './declarations.d'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useMatch, Outlet } from 'react-router'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

// import 'react-tooltip/dist/react-tooltip.css'
// import 'katex/dist/katex.min.css'
// import '@catppuccin/highlightjs/css/catppuccin-mocha.css'

import { Nav } from './pages/components/Nav'
import { Home } from './pages/home/Home'
import { ReadingList } from './pages/reading-list/ReadingList'
import { DarkModeProvider } from './pages/components/DarkModeContext'
import { DarkModeToggle } from './pages/components/DarkModeToggle'

import './global.scss'
import { Raytracer } from './pages/raytracer/Raytracer'


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


export function DarkModeToggleLayout() {
  return (
    <>
      <Outlet/>
      <DarkModeToggle/>
    </>
  );
}

export function NavLayout() {
  return (
    <>
      <Outlet/>
      <Nav/>
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <DarkModeToggleLayout/>,
    children: [
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
          {
            path: '/raytracer',
            element: <Raytracer/>,
          },
        ]
      }
    ]
  }
]);

createRoot(document.getElementById('app')!).render(
  // <StrictMode>
    <DarkModeProvider>
      <RouterProvider router={router} />
    </DarkModeProvider>
  // </StrictMode>
);
