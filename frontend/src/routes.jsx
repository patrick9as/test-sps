import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Users from "./pages/Users";
import UserEdit, { userLoader } from "./pages/UserEdit";
import SignIn from "./pages/SignIn";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <SignIn />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/users" replace />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "users/:userId",
        element: <UserEdit />,
        loader: userLoader,
      },
    ],
  },
]);

export default router;
