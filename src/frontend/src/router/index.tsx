import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import MainLayout from '../components/layouts/MainLayout';
import AuthLayout from '../components/layouts/AuthLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ThoughtsList from '../pages/ThoughtsList';
import ThoughtDetail from '../pages/ThoughtDetail';
import CreateThought from '../pages/CreateThought';
import Timeline from '../pages/Timeline';
import Connections from '../pages/Connections';
import Profile from '../pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <Login />,
          },
          {
            path: 'register',
            element: <Register />,
          },
        ],
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'thoughts',
            element: <ThoughtsList />,
          },
          {
            path: 'thoughts/new',
            element: <CreateThought />,
          },
          {
            path: 'thoughts/:id',
            element: <ThoughtDetail />,
          },
          {
            path: 'thoughts/:id/edit',
            element: <CreateThought />,
          },
          {
            path: 'timeline',
            element: <Timeline />,
          },
          {
            path: 'connections',
            element: <Connections />,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
        ],
      },
    ],
  },
]);