import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

import styles from './Nav.module.scss'

import { icons } from '../../assets'
import { onMobile, when } from '../lib'
import { useDarkMode } from './DarkModeContext'

export function Nav() {
  return onMobile() ? <MobileNav/> : <DesktopNav/>
}

function DesktopNav() {
  return (
    <div className={styles.desktopNav}>
      <h1><NavLinkStyled to="/" end>Suneel Freimuth</NavLinkStyled></h1>
      <nav>
        <Link to="/reading" className={styles.glassButton}>
          <span><span style={{ zIndex: 3 }}>📚</span> Reading</span>
        </Link>
        <a href="https://github.com/SuneelFreimuth" className={styles.glassButton}>
          <span>
            <img src={icons.github.href} alt="Github logo" />
            Github
          </span>
        </a>
        <Link to="/resume.pdf" reloadDocument className={styles.glassButton}>
          <span>Resume</span>
        </Link>
      </nav>
    </div>
  )
}

function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { darkModeOn } = useDarkMode();

  return (
    <div className={styles.mobileNav}>
      <h1><NavLinkStyled to="/" end>Suneel Freimuth</NavLinkStyled></h1>
      <img
        src={icons.hamburgerMenu.href}
        onClick={() => {
          setMenuOpen(true)
        }}
      />
      {when(
        menuOpen,
        <div
          className={styles.openMenu}
          onClick={e => {
            if (e.target !== e.currentTarget)
              return;
            setMenuOpen(false)
          }}
        >
          <div className={styles.menuTray}>
            <Link to="/">
              <span>Home</span>
            </Link>
            <Link to="/reading">
              <span>Reading</span>
            </Link>
            <a href="https://github.com/SuneelFreimuth">
              <span>Github</span>
            </a>
            <Link to="/resume.pdf" reloadDocument>
              <span>Resume</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function NavLinkStyled(props) {
  return (
    <NavLink
      {...props}
      className={({ isActive, isPending }) => (
        isActive ?
          styles.activeLink :
        isPending ?
          'pending' :
          '' 
      )}
    />
  )
}