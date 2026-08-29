import { Link, router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  BookmarkCheck,
  User,
  Settings,
  Navigation,
  Locate,
  Loader2,
} from "lucide-react";
import axios from "axios";

// 🎯 GPS HIGH ACCURACY CONFIGURATION OPTIONS
const geoOptions = {
  enableHighAccuracy: true, // Forces device to use real GPS hardware instead of rough IP location
  timeout: 10000,           // Wait maximum 10 seconds for precise fix
  maximumAge: 0,            // Do not use cached/old location values
};

export default function Header() {
  const { url, props } = usePage();
  const auth = props?.auth;
  const user = auth?.user;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Dynamic API Dropdown States
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [townsList, setTownsList] = useState([]);

  // Active Header Display States
  const [selectedCityName, setSelectedCityName] = useState("Select City");
  const [selectedAreaName, setSelectedAreaName] = useState("Select Area");

  // Temporary Form States for Modal
  const [tempStateUuid, setTempStateUuid] = useState("");
  const [tempCityUuid, setTempCityUuid] = useState("");
  const [tempCityName, setTempCityName] = useState("");
  const [tempAreaName, setTempAreaName] = useState("");
  const [geoDetectedData, setGeoDetectedData] = useState(null);

  // Loaders & Errors
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingTowns, setLoadingTowns] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Helper Function: Reverse Geocode with Lat / Long via Backend API
  const fetchLocationFromCoords = async (latitude, longitude) => {
    try {
      const res = await axios.post("/location/update", {
        latitude,
        longitude,
      });

      console.log("====================================");
      console.log("📍 HIGH ACCURACY LAT/LONG RESPONSE:", { latitude, longitude });
      console.log("📦 GOOGLE API FULL RESPONSE:", res.data);
      console.log("====================================");

      if (res.data?.success) {
        const data = res.data.data;

        console.log("Extracted City:", data?.city);
        console.log("Extracted Area:", data?.area);
        console.log("Formatted Address:", data?.formatted_address);

        const cityName = data?.city || data?.state || "Detected Location";
        const areaName = data?.area || data?.formatted_address || "";
        return { city: cityName, area: areaName };
      }
      return null;
    } catch (err) {
      console.error("❌ Geocoding API Error:", err);
      return null;
    }
  };

  // 1. First Time Visit Auto-Location Detection (WITH HIGH ACCURACY)
  useEffect(() => {
    const savedLoc = localStorage.getItem("user_selected_location");

    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        if (parsed.city) setSelectedCityName(parsed.city);
        if (parsed.area) setSelectedAreaName(parsed.area);
      } catch (e) {
        console.error(e);
      }
    } else {
      if ("geolocation" in navigator) {
        setDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`🛰️ GPS Coordinates (Accuracy: ${accuracy} meters):`, { latitude, longitude });

            const locResult = await fetchLocationFromCoords(latitude, longitude);

            if (locResult) {
              setSelectedCityName(locResult.city);
              setSelectedAreaName(locResult.area);
              localStorage.setItem(
                "user_selected_location",
                JSON.stringify(locResult)
              );
            }
            setDetectingLocation(false);
          },
          (error) => {
            console.warn("⚠️ Location error/denied:", error.message);
            setDetectingLocation(false);
          },
          geoOptions // 🎯 High Accuracy Enabled
        );
      }
    }
  }, []);

  // Modal opening handler
  const handleOpenModal = () => {
    setTempStateUuid("");
    setTempCityUuid("");
    setTempCityName("");
    setTempAreaName("");
    setGeoDetectedData(null);
    setLocationError("");
    setLocationModalOpen(true);
  };

  // 2. Fetch States on Modal Open
  useEffect(() => {
    if (locationModalOpen && statesList.length === 0) {
      axios
        .get("/location/states")
        .then((res) => {
          if (res.data?.status) setStatesList(res.data.data);
        })
        .catch(() => setLocationError("Failed to fetch states."));
    }
  }, [locationModalOpen]);

  // 3. Handle State Change -> Fetch Cities
  const handleStateChange = (e) => {
    const stateUuid = e.target.value;
    setTempStateUuid(stateUuid);
    setTempCityUuid("");
    setTempCityName("");
    setTempAreaName("");
    setGeoDetectedData(null);
    setCitiesList([]);
    setTownsList([]);

    if (stateUuid) {
      setLoadingCities(true);
      axios
        .get(`/location/cities?state_uuid=${stateUuid}`)
        .then((res) => {
          if (res.data?.status) setCitiesList(res.data.data);
        })
        .catch(() => setLocationError("Failed to load cities."))
        .finally(() => setLoadingCities(false));
    }
  };

  // 4. Handle City Change -> Fetch Towns
  const handleCityChange = (e) => {
    const cityUuid = e.target.value;
    setTempCityUuid(cityUuid);
    setTempAreaName("");
    setGeoDetectedData(null);
    setTownsList([]);

    const matchedCity = citiesList.find((c) => c.uuid === cityUuid);
    if (matchedCity) {
      setTempCityName(matchedCity.name);
    }

    if (cityUuid) {
      setLoadingTowns(true);
      axios
        .get(`/location/towns?city_uuid=${cityUuid}`)
        .then((res) => {
          if (res.data?.status) setTownsList(res.data.data);
        })
        .catch(() => setLocationError("Failed to load areas/towns."))
        .finally(() => setLoadingTowns(false));
    }
  };

  // 5. Modal Current Location Button (WITH HIGH ACCURACY)
  const handleUseCurrentLocation = () => {
    setLocationError("");
    setDetectingLocation(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`🎯 Precise Lat/Long (Accuracy: ±${accuracy}m):`, { latitude, longitude });

          const locResult = await fetchLocationFromCoords(latitude, longitude);

          if (locResult) {
            setGeoDetectedData(locResult);
            setTempCityName(locResult.city);
            setTempAreaName(locResult.area);
          } else {
            setLocationError("Could not fetch location details from Google API.");
          }
          setDetectingLocation(false);
        },
        (error) => {
          setDetectingLocation(false);
          if (error.code === error.TIMEOUT) {
            setLocationError("Location request timed out. Please try again.");
          } else {
            setLocationError("Location permission denied or unavailable.");
          }
        },
        geoOptions // 🎯 High Accuracy Enabled
      );
    } else {
      setDetectingLocation(false);
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  // Save button confirmation
  const handleApplyLocation = () => {
    const cityToSave = tempCityName || selectedCityName;
    const areaToSave = tempAreaName || selectedAreaName;

    setSelectedCityName(cityToSave);
    setSelectedAreaName(areaToSave);

    localStorage.setItem(
      "user_selected_location",
      JSON.stringify({ city: cityToSave, area: areaToSave })
    );

    setLocationModalOpen(false);
  };

  const isSaveAvailable =
    geoDetectedData !== null || (tempCityUuid !== "" && tempAreaName !== "");

  const isActive = (path) =>
    path === "/" ? url === "/" : url.startsWith(path);

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

  const isLoginPage = url.startsWith("/login");
  const authButtonConfig = isLoginPage
    ? { label: "Sign Up", href: "/register" }
    : { label: "Sign In", href: "/login" };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* FULL-PAGE LOADER WHEN AREA LIST IS LOADING */}
      {loadingTowns && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <Loader2 className="w-14 h-14 text-blue-500 animate-spin mb-4" />
          <p className="text-white font-semibold text-lg text-center">
            Fetching Area List...
          </p>
          <p className="text-gray-300 text-sm mt-1 text-center">
            Please wait a moment while we process your request.
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/images/logo.png"
            alt="ATS Logo"
            className="h-8 w-auto object-contain"
          />
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-gray-900 tracking-tight">
              ATS
            </span>
            <span className="text-xs text-blue-600 font-semibold hidden sm:inline">
              Jobs
            </span>
          </div>
        </Link>

        {/* Location Selector Button */}
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <Navigation className="w-5 h-5 text-gray-800 fill-gray-800 rotate-45 shrink-0" />
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 text-sm sm:text-base">
                {selectedCityName}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-700" />
            </div>
            <span className="text-xs text-gray-500 font-medium truncate max-w-[100px] sm:max-w-[140px]">
              {selectedAreaName || "Select Area"}
            </span>
          </div>
        </button>

        {/* Right Nav Options */}
        <div className="flex items-center gap-2 ml-auto">
          <nav className="hidden lg:flex items-center gap-0.5">
            {[
              { href: "/", label: "Home" },
              { href: "/job-search", label: "Jobs" },
              { href: "/categories", label: "Categories" },
              { href: "/services", label: "Services" },
              { href: "/about", label: "About" },
              { href: "/apps", label: "App" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(l.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {user && (
            <Link
              href="/notifications"
              className="relative flex p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 bg-blue-600 text-white rounded-xl text-sm font-medium"
              >
                <div className="w-6 h-6 bg-blue-400 rounded-lg flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
                <span className="hidden sm:inline">{displayName}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-bold text-gray-900">
                        {user.name || "Candidate"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {user.phone}
                      </p>
                    </div>

                    {[
                      { href: "/profile", icon: User, label: "My Profile" },
                      {
                        href: "/saved-jobs",
                        icon: BookmarkCheck,
                        label: "Saved Jobs",
                      },
                      { href: "/settings", icon: Settings, label: "Settings" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <item.icon className="w-4 h-4 text-gray-400" />{" "}
                        {item.label}
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
          ) : (
            <Link
              href={authButtonConfig.href}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {authButtonConfig.label}
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* LOCATION POPUP MODAL */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md my-auto rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Select Location
              </h3>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
              
              {/* Google Current Location Button */}
              <button
                onClick={handleUseCurrentLocation}
                disabled={detectingLocation}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                <div className="flex items-center gap-3">
                  {detectingLocation ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Locate className="w-5 h-5 shrink-0" />
                  )}
                  <span className="truncate">
                    {detectingLocation
                      ? "Fetching Precise Location..."
                      : "Use My Current Location"}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 -rotate-90 shrink-0" />
              </button>

              {/* Fetched Geolocation Display Card */}
              {geoDetectedData && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-800">
                  <span className="font-bold">Detected: </span>
                  {geoDetectedData.city}, {geoDetectedData.area}
                </div>
              )}

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-xs text-gray-400 font-bold uppercase">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Dynamic State Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  State
                </label>
                <div className="relative">
                  <select
                    value={tempStateUuid}
                    onChange={handleStateChange}
                    className="w-full appearance-none px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select State</option>
                    {statesList.map((state) => (
                      <option key={state.uuid} value={state.uuid}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Dynamic City Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  City
                </label>
              
                <div className="relative">
                  <select
                    value={tempCityUuid}
                    onChange={handleCityChange}
                    disabled={!tempStateUuid || loadingCities}
                    className="w-full appearance-none px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">
                      {loadingCities ? "Loading cities..." : "Select City"}
                    </option>
                    {citiesList.map((city) => (
                      <option key={city.uuid} value={city.uuid}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {loadingCities ? (
                    <Loader2 className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Dynamic Area Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Area / Town
                </label>
                <div className="relative">
                  <select
                    value={tempAreaName}
                    onChange={(e) => {
                      setTempAreaName(e.target.value);
                      setGeoDetectedData(null);
                    }}
                    disabled={!tempCityUuid || loadingTowns}
                    className="w-full appearance-none px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">
                      {loadingTowns ? "Loading areas..." : "Select Area"}
                    </option>
                    {townsList.map((town, idx) => (
                      <option key={idx} value={town.town_name}>
                        {town.town_name}
                      </option>
                    ))}
                  </select>
                  {loadingTowns ? (
                    <Loader2 className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Error Toast Message */}
              {locationError && (
                <div className="p-3 bg-red-500 text-white text-xs sm:text-sm font-medium rounded-xl text-center shadow-md">
                  {locationError}
                </div>
              )}

              {/* SAVE BUTTON */}
              {isSaveAvailable && (
                <button
                  onClick={handleApplyLocation}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm sm:text-base rounded-2xl transition-colors shadow-lg mt-2"
                >
                  Save Location
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}