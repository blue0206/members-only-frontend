import { RouterProvider } from "react-router";
import router from "@/routes";
import { Toaster } from "./components/ui/sonner";
import { useAppSelector } from "./app/hooks";
import { getTheme } from "./features/ui/uiSlice";

function App() {
  const currentTheme = useAppSelector(getTheme);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="bottom-right" theme={currentTheme} />
    </>
  );
}

export default App;
