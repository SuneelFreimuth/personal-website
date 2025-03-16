import { createContext, useState, useEffect, useContext, type PropsWithChildren } from 'react';


export const DarkModeContext = createContext({
  darkModeOn: false,
  setDarkModeOn: (_: boolean) => {}
});

export function DarkModeProvider({ children }: PropsWithChildren<{}>) {
  const [darkModeOn, setDarkModeOn] = useState(false);

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
