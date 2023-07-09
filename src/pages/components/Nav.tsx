import { NavLink, Link } from 'react-router-dom'

import styles from './Nav.module.scss'

const GITHUB_LOGO = new URL('../../assets/github-icon.svg', import.meta.url);

export function Nav({ maximized }: { maximized: boolean }) {
  return (
    <div className={maximized ? styles.navMaximized : styles.navMinimized}>
      <h1><NavLinkStyled to="/" end>Suneel Freimuth</NavLinkStyled></h1>
      <nav>
        <a href="https://github.com/SuneelFreimuth">
          <span>
            <img src={GITHUB_LOGO.toString()} alt="Github logo" />
            Github
          </span>
        </a>
        <NavLinkStyled to="/blog" end>
          <span>Blog</span>
        </NavLinkStyled>
        <Link to="/resume.pdf" reloadDocument>
          <span>Resume</span>
        </Link>
      </nav>
    </div>
  )
}

function NavLinkStyled(props) {
  return (
    <NavLink {...props} className={({ isActive, isPending }) => (
      isActive ?
        styles.activeLink :
      isPending ?
        'pending' :
        '' 
    )} />
  )
}