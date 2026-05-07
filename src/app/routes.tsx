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
import { HRManager } from "./components/HRManager";
import { Settings } from "./components/Settings";
import { SuperLuna } from "./components/SuperLuna";
import { LunaModules } from "./components/LunaModules";
import { Enterprise9Security } from "./components/Enterprise9Security";
import { GridLicenseManager } from "./components/GridLicenseManager";
import { LunaAdBasePro } from "./components/LunaAdBasePro";
import { Empowr } from "./components/Empowr";
import { GoogleSearch } from "./components/GoogleSearch";
import { WeatherSearch } from "./components/WeatherSearch";
import { SuperLunaSearch } from "./components/SuperLunaSearch";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "about", element: <ProtectedRoute><About /></ProtectedRoute> },
      { path: "contact", element: <ProtectedRoute><Contact /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "mydesktop", element: <ProtectedRoute><MyDesktop /></ProtectedRoute> },
      { path: "features", element: <ProtectedRoute><Features /></ProtectedRoute> },
      { path: "visualizations", element: <ProtectedRoute><Visualizations /></ProtectedRoute> },
      { path: "administrator", element: <ProtectedRoute><AdministratorTabbed /></ProtectedRoute> },
      { path: "transactions", element: <ProtectedRoute><Transactions /></ProtectedRoute> },
      { path: "voiceprompt", element: <ProtectedRoute><VoicePrompt /></ProtectedRoute> },
      { path: "uploadprompt", element: <ProtectedRoute><UploadPrompt /></ProtectedRoute> },
      { path: "startrecording", element: <ProtectedRoute><StartRecording /></ProtectedRoute> },
      { path: "textsearch", element: <ProtectedRoute><TextSearch /></ProtectedRoute> },
      { path: "aisearch", element: <ProtectedRoute><AISearch /></ProtectedRoute> },
      { path: "userhelp", element: <ProtectedRoute><UserHelp /></ProtectedRoute> },
      { path: "usernotifications", element: <ProtectedRoute><UserNotifications /></ProtectedRoute> },
      { path: "networkinfo", element: <ProtectedRoute><NetworkInfo /></ProtectedRoute> },
      { path: "hrmanager", element: <ProtectedRoute><HRManager /></ProtectedRoute> },
      { path: "lunamodules", element: <ProtectedRoute><LunaModules /></ProtectedRoute> },
      { path: "security", element: <ProtectedRoute><Enterprise9Security /></ProtectedRoute> },
      { path: "settings", element: <ProtectedRoute><Settings /></ProtectedRoute> },
      { path: "superluna", element: <ProtectedRoute><SuperLuna /></ProtectedRoute> },
      { path: "gridlicensemanager", element: <ProtectedRoute><GridLicenseManager /></ProtectedRoute> },
      { path: "lunaadbasepro", element: <ProtectedRoute><LunaAdBasePro /></ProtectedRoute> },
      { path: "empowr", element: <ProtectedRoute><Empowr /></ProtectedRoute> },
      { path: "googlesearch", element: <ProtectedRoute><GoogleSearch /></ProtectedRoute> },
      { path: "weathersearch", element: <ProtectedRoute><WeatherSearch /></ProtectedRoute> },
      { path: "superlunasearch", element: <ProtectedRoute><SuperLunaSearch /></ProtectedRoute> },
    ],
  },
]);