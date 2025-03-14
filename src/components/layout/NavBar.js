import React from 'react'
import styled from 'styled-components';
import { logoutUser } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { FaSeedling, FaSignOutAlt, FaHome, FaUser } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';


const Sidebar = styled.div`
  width: 260px;
  background: #4975d1;
  color: white;
  padding: 24px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const SidebarHeader = styled.div`
  padding: 0 24px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.h1`
  font-size: 22px;
  margin: 0;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 12px;
  }
`;

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <Sidebar className="fixed top-0 left-0 h-screen ">
      <SidebarHeader>
        <Logo>
          <FaSeedling /> Smart Garden
        </Logo>
      </SidebarHeader>
      <nav className="flex-1">
        <ul className="">
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={location.pathname === '/dashboard' ? 'bg-blue-500 rounded' : ''}>
              <li className="flex items-center gap-4 p-2 hover:bg-blue-500 rounded cursor-pointer">
                <FaHome />
                <span> Dashboard</span>
              </li>
            </div>
          </Link>
          <Link to="/users" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={location.pathname === '/users' ? 'bg-blue-500 rounded' : ''}>
              <li className="flex items-center gap-4 p-2 hover:bg-blue-500 rounded cursor-pointer">
                <FaUser />
                <span> Users</span>
              </li>
            </div>
          </Link>
          <li className='flex items-center gap-4 p-2 hover:bg-blue-500 rounded cursor-pointer' onClick={() => logoutUser(navigate)}>
            <FaSignOutAlt />
            <span>
              Log Out
            </span>
          </li>
        </ul>
      </nav>
    </Sidebar>
  )
}

export default NavBar
