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
import { Home } from './pages/Home'
import { Blog } from './pages/Blog'
import { BlogPost, loader as blogPostLoader } from './pages/BlogPost'
import { EditBlogPost } from './pages/EditBlogPost'

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


export function App() {
  const atHome = useMatch("/") !== null;

  return (
    <>
      <Nav maximized={atHome}/>
      <Outlet />
    </>
  )
}

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
      {
        path: "/blog/:postId",
        loader: blogPostLoader,
        element: <BlogPost/>
      },
      {
        path: "/edit-blog/:postId",
        // loader: blogPostLoader,
        element: <EditBlogPost/>
      }
    ]
  },
]);

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
