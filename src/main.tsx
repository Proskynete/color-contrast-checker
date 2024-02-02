import "./assets/styles/base.css";
import "./assets/styles/components.css";
import "./assets/styles/utilities.css";

import ReactDOM from "react-dom/client";
import App from "./App.tsx";

const root = document.getElementById("root") as HTMLElement;
ReactDOM.createRoot(root).render(<App />);
