import './Titlebar.css';
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

function Titlebar() {
  const name = document.cookie.replace(/(?:(?:^|.*;\s*)Username\s*=\s*([^;]*).*$)|^.*$/, "$1");
  const staff = document.cookie.replace(/(?:(?:^|.*;\s*)Staff\s*=\s*([^;]*).*$)|^.*$/, "$1");

  const handleLogout = () => {
    // Delete the "Username" and "Staff" cookie
    document.cookie = "Username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "Staff=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
    // Refresh the page
    window.location.reload();
  };

  const location = useLocation(); // This is a hook that gives you the current location

  return (
    <div className="topnav">
      <div className="dropdown">
        <NavLink className="nav no-hover">{name ? `Hello ${name}` : 'Hello Guest'}</NavLink>
        <div className="dropdown-content">
          {/* Hide "Staff Dashboard, User Dashboard" if user is not Logged in */}
          {staff === "1" && name !== "" && <NavLink className="nav" to="/staffdashboard">Staff Dashboard</NavLink>}
          {staff === "1" && name !== "" && <NavLink className="nav" to="/userdashboard">User Dashboard</NavLink>}
          {staff === "0" && name !== "" && <NavLink className="nav" to="/userdashboard">User Dashboard</NavLink>}
          {/* Hide "Logout" if user is not Logged in */}
          {name !== "" && <NavLink className="nav" onClick={handleLogout}>Logout</NavLink>}
          {/* Hide "Sign Up" and Login" if user is Logged in */}
          {name === "" && <NavLink className="nav" to="/signup">Sign Up</NavLink>}
          {name === "" && <NavLink className="nav" to="/login">Login</NavLink>}
        </div>
      </div>
    {/* If the current locations path is "/" then the class used will be "nav currently-selected" if not it will use "nav" */}
    <NavLink className={location.pathname === "/" ? "nav currently-selected" : "nav"} to="/">Home</NavLink> 
    <NavLink className={location.pathname === "/books" ? "nav currently-selected" : "nav"} to="/books">Books</NavLink> 
    <NavLink className={location.pathname === "/support" ? "nav currently-selected" : "nav"} to="/support">Support</NavLink>

    {/* Trying to integrate another button won't work
    By containing it in a div, it will fix this issue */}
    <div className="search-bar-container">
      <form className="search-bar" action="/search">
        <input type="search" name="q" placeholder="Search books..." />
        <button type="submit"><i class="fa fa-search"></i></button>
        </form>
    </div>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" media="all"></link>
    </div>
  );
}

export default Titlebar;