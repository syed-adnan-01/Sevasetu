import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { ReportUpload } from "./components/ReportUpload";
import { TaskList } from "./components/TaskList";
import { VolunteerMatching } from "./components/VolunteerMatching";
import { AdminPanel } from "./components/AdminPanel";
import { TaskCompletion } from "./components/TaskCompletion";

import { ReportsHistory } from "./components/ReportsHistory";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "reports", Component: ReportUpload },
      { path: "history", Component: ReportsHistory },
      { path: "tasks", Component: TaskList },
      { path: "volunteers", Component: VolunteerMatching },
      { path: "admin", Component: AdminPanel },
      { path: "complete/:taskId", Component: TaskCompletion },
    ],
  },
]);
