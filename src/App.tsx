import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DefaultLayout from './layout/DefaultLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import ErrorPage from './pages/ErrorPage';
import { Toaster } from 'react-hot-toast';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: <SignIn />,
      },
      {
        path: 'register',
        element: <SignUp />,
      },
    ],
  },
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
      <Toaster />
    </React.StrictMode>
  );
}

export default App;