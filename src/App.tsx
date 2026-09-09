import { useRoutes } from "react-router-dom";
import { routes } from "./routes/routes";
import AppUpdateBanner from "@components/Common/AppUpdateBanner";

function App() {
  const element = useRoutes(routes);
  return (
    <>
      {element}
      {/* Watches for a newer deployed build and reloads onto it — see
          utils/appUpdate.ts. Rendered at the root so it survives navigation. */}
      <AppUpdateBanner />
    </>
  );
}

export default App;
