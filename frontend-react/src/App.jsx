import { Routes, Route } from 'react-router-dom';
import VistaPrincipal from './pages/principal/principal';

function App() {
  return (
    <Routes>
      <Route path="/" element={<VistaPrincipal />} />
    </Routes>
  );
}

export default App;
