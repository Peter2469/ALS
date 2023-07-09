import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import HomepageContents from './HomepageContents';
import Titlebar from './Titlebar';
import Footer from './Footer';
import Books from './Books';
import Support from './Support';
import Search from './Search';
import Signup from './Signup';
import Login from './Login';
import UserDashboard from './UserDashboard';
import StaffDashboard from './StaffDashboard';
import BookDetails from './BookDetails';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Titlebar />
    <Routes>
      <Route path="/" element={<HomepageContents />} />
      <Route path="/books" element={<Books />} />
      <Route path="/support" element={<Support />} />
      <Route path="/search" element={<Search />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/userdashboard" element={<UserDashboard />} />
      <Route path="/staffdashboard" element={<StaffDashboard />} />
      <Route path="/books/:id" element={<BookDetails />} />
    </Routes>
    <Footer />
  </Router>
)