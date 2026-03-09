import { createBrowserRouter } from "react-router";
import { Home } from "./components/Home";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Profile } from "./components/Profile";
import { MyDesktop } from "./components/MyDesktop";
import { Features } from "./components/Features";
import { Visualizations } from "./components/Visualizations";
import { Administrator } from "./components/Administrator";
import { Transactions } from "./components/Transactions";
import { Login } from "./components/Login";
import { Root } from "./components/Root";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Root />,
        children: [
          { index: true, element: <Home /> },
          { path: "about", element: <About /> },
          { path: "contact", element: <Contact /> },
          { path: "profile", element: <Profile /> },
          { path: "mydesktop", element: <MyDesktop /> },
          { path: "features", element: <Features /> },
          { path: "visualizations", element: <Visualizations /> },
          { path: "administrator", element: <Administrator /> },
          { path: "transactions", element: <Transactions /> },
        ],
      },
    ],
  },
]);