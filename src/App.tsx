import {useEffect} from "react";
import Navigation from "@/components/Navigation.tsx";
import ControlPanel from "@/components/ControlPanel.tsx";
import ChoicesPanel from "@/components/ChoicesPanel.tsx";
//import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/bootstrap.min.css';
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export const controlMode = process.env.BUN_PUBLIC_CONTROL_MODE || 'private';
if (!['public', 'private'].includes(controlMode)) {
  throw new Error(`Invalid control mode '${controlMode}'`);
}


export function App() {

  useEffect(() => {
    // Apply the data-bs-theme attribute to the html element
    document.documentElement.setAttribute('data-bs-theme', 'light');
  }, []);

  return (
    <div className="app">
      <Navigation/>
      {(controlMode == 'public') ?
        <ChoicesPanel/> :
        <ControlPanel/>
        }
    </div>
  );
}

export default App;
