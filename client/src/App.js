import logo from './logo.svg';
import './App.css';
import Navbar from './Components/Navbar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Homescreen from './Screens/Homescreen';
import Bookingscreen from './Screens/Bookingscreen';
import Registerscreen from './Screens/Registerscreen';
import Loginscreen from './Screens/Loginscreen';
import Profilescreen from './Screens/Profilescreen';
import Adminscreen from './Screens/Adminscreen';
import Landingscreen from './Screens/Landingscreen';

function App() {
  return (
    <div className="App">
      <Navbar />
      <BrowserRouter>
        <Routes>
          {/* Use 'element' instead of 'component' */}
          <Route path="/home" element={<Homescreen />} />
          <Route path="/book/:roomid/:fromdate/:todate" element={<Bookingscreen />} />
          <Route path="/register" element={<Registerscreen/>} />
          <Route path="/login" element={<Loginscreen/>} />  
    <Route path="/Profile" element={<Profilescreen/>}/>
    <Route path="/admin" element={<Adminscreen/>}/>
    <Route path="/" element={<Landingscreen/>}/>
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
