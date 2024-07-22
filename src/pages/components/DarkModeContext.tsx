import { createContext, useState, useEffect, useContext } from 'react';


export const DarkModeContext = createContext({
  darkModeOn: false,
  setDarkModeOn: (_: boolean) => {}
});

export function DarkModeProvider({ children }) {
  const [darkModeOn, setDarkModeOn] = useState(true);

  useEffect(() => {
    if (darkModeOn)
      document.body.classList.add('dark');
    else
      document.body.classList.remove('dark');
  }, [darkModeOn]);

  return (
    <DarkModeContext.Provider value={{ darkModeOn, setDarkModeOn }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export const useDarkMode = () => useContext(DarkModeContext);
