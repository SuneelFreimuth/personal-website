import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

import styles from './Nav.module.scss'

const GITHUB_LOGO = new URL('../../assets/github-icon.svg', import.meta.url);
const HAMBURGER_ICON = new URL('../../assets/hamburger-icon.png', import.meta.url)
const MOBILE_THRESHOLD = '775px'

export function Nav() {
  const onMobile = window.matchMedia(`(max-width: ${MOBILE_THRESHOLD})`)
  return onMobile.matches ? <MobileNav/> : <DesktopNav/>
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
            <img src={GITHUB_LOGO.toString()} alt="Github logo" />
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

  return (
    <div className={styles.mobileNav}>
      <h1><NavLinkStyled to="/" end>Suneel Freimuth</NavLinkStyled></h1>
      <img
        src={HAMBURGER_ICON.href}
        onClick={() => {
          setMenuOpen(true)
        }}
      />
      {menuOpen ?
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
        </div> :
        null
      }
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