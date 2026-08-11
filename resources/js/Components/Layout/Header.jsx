import { Link, router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
  Briefcase,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  BookmarkCheck,
  User,
  Settings,
  MapPin,
  Edit3,
} from "lucide-react";
import useLocation from "@/Hooks/useLocation";

const INDIA_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune", "Chennai",
  "Kolkata", "Noida", "Gurugram", "Jaipur", "Lucknow", "Kochi", "Remote",
];

const desktopNavLinks = [
  { href: "/", label: "Home" },
  { href: "/job-search", label: "Jobs" },
  { href: "/categories", label: "Categories" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/apps", label: "App" },
];

export default function Header() {
  const { url, props } = usePage();
  const auth = props?.auth;
  const user = auth?.user;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  // Hook location data
  const userLocation = useLocation();
  const [currentCity, setCurrentCity] = useState("Bengaluru");

  useEffect(() => {
    if (user?.city) {
      setCurrentCity(user.city);
    } else if (userLocation?.city) {
      setCurrentCity(userLocation.city);
    }
  }, [userLocation, user]);

  const isActive = (path) =>
    path === "/" ? url === "/" : url.startsWith(path);

  const handleCitySelect = (city) => {
    setCurrentCity(city);
    setLocationOpen(false);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    router.post(route("logout"));
  };

  const displayName = user?.name ? user.name.split(" ")[0] : null;
  const initials = user?.name
    ? user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "?";

  // Check current URL for Dynamic Sign In / Register toggle
  const isLoginPage = url.startsWith("/login");
  const authButtonConfig = isLoginPage
    ? { label: "Sign Up", href: "/register" }
    : { label: "Sign In", href: "/login" };

  // Close dropdowns on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setLocationOpen(false);
  }, [url]);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* Logo Image */}
          <img
            src="/images/logo.png" // Apne public folder ke logo ka path dalein
            alt="ATS Logo"
            className="h-8 w-auto object-contain" // Height adjust kar sakte hain
          />

          {/* Brand Name (Optional - agar logo me name nahi hai) */}
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-gray-900 tracking-tight">ATS</span>
            <span className="text-xs text-blue-600 font-semibold hidden sm:inline">Jobs</span>
          </div>
        </Link>

        {/* City selector */}
        <div className="relative">
          <button
            onClick={() => {
              setLocationOpen(!locationOpen);
              setProfileOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-xl text-sm transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-medium text-amber-800 max-w-[90px] truncate hidden sm:inline">
              {currentCity}
            </span>
            <span className="text-amber-800 font-medium text-xs inline sm:hidden">📍</span>
            <Edit3 className="w-3 h-3 text-amber-500" />
          </button>

          {locationOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLocationOpen(false)} />
              <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 max-h-72 overflow-y-auto">
                <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Select City 🇮🇳
                </p>
                {INDIA_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${currentCity === city
                        ? "text-blue-600 font-semibold bg-blue-50"
                        : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    {city}
                    {currentCity === city && <span className="ml-auto text-blue-600">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Section: Desktop Nav + Auth Action / Profile */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {desktopNavLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive(l.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Bell Icon: Sirf Tabhi Dikhega Jab User Logged In Ho */}
          {user && (
            <Link
              href="/notifications"
              className="relative flex p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
          )}

          {/* Logged In User Profile OR Dynamic Auth Toggle Button */}
          {/* {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setLocationOpen(false);
                }}
                className="flex items-center gap-2 pl-1 pr-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <div className="w-6 h-6 bg-blue-400 rounded-lg flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
                <span className="hidden sm:inline">{displayName}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-bold text-gray-900">{user.name || "Candidate"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user.phone}</p>
                    </div>

                    {[
                      { href: "/profile", icon: User, label: "My Profile" },
                      { href: "/saved-jobs", icon: BookmarkCheck, label: "Saved Jobs" },
                      { href: "/notifications", icon: Bell, label: "Notifications" },
                      { href: "/settings", icon: Settings, label: "Settings" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <item.icon className="w-4 h-4 text-gray-400" /> {item.label}
                      </Link>
                    ))}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : ( */}

             {/* Single Dynamic Button: Login page par "Register" & bakiyo par "Sign In" */ }


            {/* <Link
              href={authButtonConfig.href}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {authButtonConfig.label}
            </Link>
          )} */}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          {[
            { href: "/categories", label: "Job Categories" },
            { href: "/services", label: "Services" },
            { href: "/about", label: "About ATS" },
            { href: "/apps", label: "📱 Download App" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center px-4 py-3 text-sm text-gray-700 border-b border-gray-50 hover:bg-gray-50"
            >
              {l.label}
            </Link>
          ))}
          {!user && (
            <div className="p-4">
              <Link
                href={authButtonConfig.href}
                className="block w-full py-2 bg-blue-600 text-white text-center rounded-xl text-sm font-semibold"
              >
                {authButtonConfig.label}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}