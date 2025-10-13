import Navigation from "@/components/Navigation.tsx";
import ControlPanel from "@/components/ControlPanel.tsx";
//import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/bootstrap.min.css';
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export function App() {
  return (
    <div className="app">
      <Navigation/>
      <ControlPanel/>
    </div>
  );
}

export default App;
