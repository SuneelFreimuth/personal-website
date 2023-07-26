import './declarations.d'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import { initializeApp } from "firebase/app";
import {
   getFirestore,
   getDoc,
   updateDoc
} from 'firebase/firestore/lite';

import { App } from './App'
import { Home } from './pages/Home'
import { Blog } from './pages/Blog'
import { BlogPost, loader as blogPostLoader } from './pages/BlogPost'
import { EditBlogPost } from './pages/EditBlogPost'

import 'react-tooltip/dist/react-tooltip.css'
import 'katex/dist/katex.min.css'
import '@catppuccin/highlightjs/css/catppuccin-mocha.css'
import './global.scss'

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
])

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
