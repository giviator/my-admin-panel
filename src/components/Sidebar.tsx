import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav>
        <ul>
          <li className="mb-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'block p-2 bg-blue-600 rounded' : 'block p-2 hover:bg-gray-700 rounded'
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? 'block p-2 bg-blue-600 rounded' : 'block p-2 hover:bg-gray-700 rounded'
              }
            >
              Profile
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to="/auth/login"
              className={({ isActive }) =>
                isActive ? 'block p-2 bg-blue-600 rounded' : 'block p-2 hover:bg-gray-700 rounded'
              }
            >
              Login
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to="/auth/register"
              className={({ isActive }) =>
                isActive ? 'block p-2 bg-blue-600 rounded' : 'block p-2 hover:bg-gray-700 rounded'
              }
            >
              Register
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? 'block p-2 bg-blue-600 rounded' : 'block p-2 hover:bg-gray-700 rounded'
              }
            >
              Товари
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;