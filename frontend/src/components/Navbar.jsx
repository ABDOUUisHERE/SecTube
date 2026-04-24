import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUpload, FaUser, FaSignOutAlt, FaBars, FaCog, FaVideo, FaGavel, FaCommentAlt } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';
import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import useSidebarStore from '../store/sidebarStore';
import useChatbotStore from '../store/chatbotStore';
import useThemeStore from '../store/themeStore';
import useMessageStore from '../store/messageStore';
import ConfirmDialog from './ConfirmDialog';
import Z_INDEX from '../config/zIndex';
import { getAvatarUrl } from '../config/constants';
import { useDropdownPosition, getDropdownClasses } from '../hooks/useDropdownPosition';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { toggleSidebar } = useSidebarStore();
  const { toggleChatbot } = useChatbotStore();
  const { theme } = useThemeStore();
  const { unreadCount } = useMessageStore();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  const userMenuPosition = useDropdownPosition(userMenuRef, showUserMenu, 200);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    addToast({ type: 'info', message: 'You have been logged out successfully.' });
    navigate('/');
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <nav className="bg-dark-900 border-b border-dark-800 sticky top-0" style={{ zIndex: Z_INDEX.NAVBAR }}>
        <div className="px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Hamburger Menu & Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-white transition p-1.5 sm:p-2 hover:bg-dark-800 rounded-md border border-transparent"
            aria-label="Toggle sidebar"
          >
            <FaBars size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 group">
            <img
              src="/logo.png"
              alt="SecTube Logo"
              className="h-8 sm:h-10 w-auto transition-[filter] duration-300"
              style={theme === 'light' ? { filter: 'brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(185deg) brightness(0.25)' } : undefined}
            />
            <span className="hidden sm:inline-block bg-primary-600/10 text-primary-500 border border-primary-500/20 px-1.5 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">
              Beta
            </span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl flex items-center justify-end gap-1.5 sm:gap-2">
          {/* Search Icon (Mobile Only) */}
          <button
            onClick={() => setShowSearch(true)}
            className="md:hidden p-1.5 text-gray-500 hover:text-white transition hover:bg-dark-800 rounded-md"
            title="Search"
          >
            <FaSearch size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="flex w-full shadow-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="flex-1 bg-dark-950 border border-dark-700 hover:border-dark-600 rounded-l-md px-4 h-[34px] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
              <button
                type="submit"
                className="bg-dark-800 hover:bg-dark-700 border border-l-0 border-dark-700 hover:border-dark-600 rounded-r-md px-4 h-[34px] transition-colors"
              >
                <FaSearch className="text-gray-400" size={16} />
              </button>
            </div>
          </form>

          {/* Ask AI Button (Desktop) */}
          <button
            onClick={toggleChatbot}
            className="hidden md:flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 bg-primary-600/10 hover:bg-primary-600/20 text-primary-500 hover:text-primary-400 border border-primary-500/20 rounded-md text-xs lg:text-sm font-medium transition-all duration-300 h-[34px]"
          >
            <span className="hidden lg:inline">Ask AI</span>
            <BsStars size={16} />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Ask AI Button (Mobile/Tablet) */}
          <button
            onClick={toggleChatbot}
            className="flex md:hidden items-center justify-center p-1.5 text-gray-500 hover:text-primary-500 transition-colors"
            title="Ask AI"
          >
            <BsStars size={18} />
          </button>

          {isAuthenticated && (
            <>
              <Link
                to="/messages"
                className="relative p-1.5 text-gray-500 hover:text-white transition hover:bg-dark-800 rounded-md"
                title="Messages"
              >
                <FaCommentAlt size={16} className="sm:w-[18px] sm:h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-[9px] font-bold min-w-[14px] h-3.5 rounded-full flex items-center justify-center px-0.5 shadow-[0_0_6px_rgba(14,165,233,0.5)]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <div className="w-px h-5 bg-dark-700 mx-0.5" />
            </>
          )}

          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-dark-800 transition border-2 border-transparent hover:border-dark-700"
              >
                <img
                  src={getAvatarUrl(user?.avatar)}
                  alt={user?.displayName || user?.username}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = getAvatarUrl();
                  }}
                />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className={`absolute right-0 ${getDropdownClasses(userMenuPosition)} w-48 sm:w-56 bg-dark-900 rounded-md shadow-xl border border-dark-700 py-1.5 z-50`}>
                  {/* User Info */}
                  <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-dark-800">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs sm:text-sm font-medium text-white truncate">{user?.displayName || user?.username}</p>
                      {user?.role === 'admin' && (
                        <span className="bg-red-600/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">@{user?.username}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-dark-800 transition text-xs sm:text-sm text-gray-300 hover:text-white"
                      >
                        <FaGavel size={12} className="sm:w-[14px] sm:h-[14px]" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-dark-800 transition text-xs sm:text-sm text-gray-300 hover:text-white"
                    >
                      <FaCog size={12} className="sm:w-[14px] sm:h-[14px]" />
                      <span>Settings</span>
                    </Link>
                    {user?.isStreamer && (
                      <Link
                        to={`/channel/${user?.username}`}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-dark-800 transition text-xs sm:text-sm text-gray-300 hover:text-white"
                      >
                        <FaVideo size={12} className="sm:w-[14px] sm:h-[14px]" />
                        <span>My Channel</span>
                      </Link>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-dark-800 py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogoutClick();
                      }}
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-dark-800 transition text-xs sm:text-sm text-red-500 hover:text-red-400 w-full"
                    >
                      <FaSignOutAlt size={12} className="sm:w-[14px] sm:h-[14px]" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-300 hover:text-white font-medium border border-dark-700/50 rounded-md hover:bg-dark-800 transition"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-2 sm:px-3 py-1.5 bg-primary-600 hover:bg-primary-700 rounded-md text-xs sm:text-sm font-medium text-white border border-primary-700 shadow-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
        </div>
      </nav>

      {/* Search Overlay */}
      {showSearch && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 sm:pt-24 px-4"
          onClick={() => setShowSearch(false)}
        >
          <div
            ref={searchRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl animate-in fade-in slide-in-from-top-4 duration-200"
          >
            <form onSubmit={handleSearch}>
              <div className="flex shadow-2xl">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="flex-1 bg-dark-900 border border-dark-700 hover:border-dark-600 rounded-l-lg px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-600 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 border border-primary-700 rounded-r-lg px-6 sm:px-8 py-3 sm:py-4 transition"
                >
                  <FaSearch className="text-white" size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        type="warning"
      />
    </>
  );
};

export default Navbar;
