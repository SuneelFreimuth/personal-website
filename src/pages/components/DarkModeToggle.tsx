import { useContext } from "react";

import { DarkModeContext } from "./DarkModeContext";
import styles from './DarkModeToggle.module.scss';
import { icons } from "../../assets";

export function DarkModeToggle() {
  const { darkModeOn, setDarkModeOn } = useContext(DarkModeContext);

  return (
    <button
      className={styles.darkModeToggle}
      onClick={() => {
        setDarkModeOn(!darkModeOn);
      }}
    >
      <img src={darkModeOn ? icons.sun.href : icons.moon.href}/>
    </button>
  );
}
