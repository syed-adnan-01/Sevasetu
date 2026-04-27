import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { ReportUpload } from "./components/ReportUpload";
import { TasksPage } from "./components/TasksPage";
import { VolunteerMatching } from "./components/VolunteerMatching";
import { AdminPanel } from "./components/AdminPanel";
import { TaskCompletion } from "./components/TaskCompletion";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { LandingPage } from "./components/LandingPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";

import { ReportsHistory } from "./components/ReportsHistory";
import { Analytics } from "./components/Analytics";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", Component: Dashboard },
      { path: "reports", Component: ReportUpload },
      { path: "history", Component: ReportsHistory },
      { path: "tasks", Component: TasksPage },
      { path: "volunteers", Component: VolunteerMatching },
      { 
        path: "admin", 
        element: (
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        ) 
      },
      { path: "analytics", Component: Analytics },
      { path: "complete/:taskId", Component: TaskCompletion },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Register,
  }
]);
