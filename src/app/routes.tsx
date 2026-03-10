import { createBrowserRouter } from "react-router";
import { Home } from "./components/Home";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Profile } from "./components/Profile";
import { MyDesktop } from "./components/MyDesktop";
import { Features } from "./components/Features";
import { Visualizations } from "./components/Visualizations";
import { AdministratorTabbed } from "./components/AdministratorTabbed";
import { Transactions } from "./components/Transactions";
import { VoicePrompt } from "./components/VoicePrompt";
import { UploadPrompt } from "./components/UploadPrompt";
import { StartRecording } from "./components/StartRecording";
import { TextSearch } from "./components/TextSearch";
import { AISearch } from "./components/AISearch";
import { UserHelp } from "./components/UserHelp";
import { UserNotifications } from "./components/UserNotifications";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Root } from "./components/Root";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NetworkInfo } from "./components/NetworkInfo";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Root />,
        children: [
          { path: "about", element: <About /> },
          { path: "contact", element: <Contact /> },
          { path: "profile", element: <Profile /> },
          { path: "mydesktop", element: <MyDesktop /> },
          { path: "features", element: <Features /> },
          { path: "visualizations", element: <Visualizations /> },
          { path: "administrator", element: <AdministratorTabbed /> },
          { path: "transactions", element: <Transactions /> },
          { path: "voiceprompt", element: <VoicePrompt /> },
          { path: "uploadprompt", element: <UploadPrompt /> },
          { path: "startrecording", element: <StartRecording /> },
          { path: "textsearch", element: <TextSearch /> },
          { path: "aisearch", element: <AISearch /> },
          { path: "userhelp", element: <UserHelp /> },
          { path: "usernotifications", element: <UserNotifications /> },
          { path: "networkinfo", element: <NetworkInfo /> },
        ],
      },
    ],
  },
]);