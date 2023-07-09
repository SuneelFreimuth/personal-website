import { useMatch, Outlet } from 'react-router'

import { Nav } from './pages/components/Nav'

import './App.module.scss'

export function App() {
  const atHome = useMatch("/");

  return (
    <>
      <Nav maximized={atHome !== null}/>
      <Outlet />
    </>
  )
}
