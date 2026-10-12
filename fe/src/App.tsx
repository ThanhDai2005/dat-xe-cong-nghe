import { RouterProvider } from "react-router";
import router from "./routes/indexRoute";

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
