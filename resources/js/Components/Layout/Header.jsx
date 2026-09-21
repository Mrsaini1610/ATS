import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, router, usePage } from "@inertiajs/react";
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
  Search,
  MapPin,
  Sparkles,
  Check,
} from "lucide-react";
import axios from "axios";

// Curated Popular Localities for Top Cities
const POPULAR_LOCALITIES_BY_CITY = {
  Jaipur: [
    "Vaishali Nagar",
    "Mansarovar",
    "Malviya Nagar",
    "C-Scheme",
    "Tonk Road",
    "Sitapura",
    "Raja Park",
    "Sodala",
    "Sanganer",
    "Jhotwara",
  ],
  "Delhi NCR": [
    "Noida",
    "Gurugram",
    "Connaught Place",
    "Saket",
    "Rohini",
    "South Extension",
    "Laxmi Nagar",
    "Dwarka",
  ],
  Bengaluru: [
    "Koramangala",
    "Indiranagar",
    "HSR Layout",
    "Whitefield",
    "BTM Layout",
    "Electronic City",
    "Jayanagar",
  ],
  Mumbai: [
    "Andheri",
    "Bandra",
    "Powai",
    "Thane",
    "Navi Mumbai",
    "Dadar",
    "Borivali",
  ],
  Pune: [
    "Hinjawadi",
    "Viman Nagar",
    "Kothrud",
    "Baner",
    "Wakad",
    "Hadapsar",
  ],
};

const POPULAR_CITIES = ["Jaipur", "Delhi NCR", "Bengaluru", "Mumbai", "Pune"];

export default function Header() {
  const { url, props } = usePage();
  const auth = props?.auth;
  const user = auth?.user;

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Active Header Display States
  const [selectedCityName, setSelectedCityName] = useState("Select City");
  const [selectedAreaName, setSelectedAreaName] = useState("Select Area");

  // Google Places Autocomplete States
  const [areaSearchInput, setAreaSearchInput] = useState("");
  const [googlePredictions, setGooglePredictions] = useState([]);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const autocompleteServiceRef = useRef(null);

  // Dynamic API Dropdown States
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [townsList, setTownsList] = useState([]);

  // Temporary Form States for Modal
  const [tempStateUuid, setTempStateUuid] = useState("");
  const [tempCityUuid, setTempCityUuid] = useState("");
  const [tempCityName, setTempCityName] = useState("");
  const [tempAreaName, setTempAreaName] = useState("");
  const [activeCityTab, setActiveCityTab] = useState("Jaipur");
  const [geoDetectedData, setGeoDetectedData] = useState(null);

  // Loaders & Errors
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingTowns, setLoadingTowns] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [activeTab, setActiveTab] = useState("search"); // 'search' | 'popular' | 'manual'

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Initialize Google Places Service for live Area Autocomplete
  useEffect(() => {
    if (window.google?.maps?.places?.AutocompleteService) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) return;

    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.maps?.places?.AutocompleteService) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
      };
      document.head.appendChild(script);
    } else {
      const timer = setInterval(() => {
        if (window.google?.maps?.places?.AutocompleteService) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
          clearInterval(timer);
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [GOOGLE_MAPS_API_KEY]);

  // Handle Google Places predictions on typing
  useEffect(() => {
    if (!areaSearchInput.trim() || areaSearchInput.length < 2) {
      setGooglePredictions([]);
      return;
    }

    const timer = setTimeout(() => {
      if (autocompleteServiceRef.current) {
        setLoadingGoogle(true);
        try {
          autocompleteServiceRef.current.getPlacePredictions(
            {
              input: areaSearchInput,
              componentRestrictions: { country: "in" },
              types: ["sublocality", "neighborhood", "locality"],
            },
            (predictions, status) => {
              setLoadingGoogle(false);
              if (status === "OK" && predictions) {
                setGooglePredictions(predictions);
              } else {
                setGooglePredictions([]);
              }
            }
          );
        } catch (e) {
          setLoadingGoogle(false);
        }
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [areaSearchInput]);

  // Helper Function: Reverse Geocode with Lat / Long
  const fetchLocationFromCoords = async (latitude, longitude) => {
    // 1. Try backend endpoint
    try {
      const res = await axios.post("/location/update", { latitude, longitude });
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        const cityName = data?.city || data?.state || "Jaipur";
        const areaName = data?.area || data?.formatted_address || "";
        return { city: cityName, area: areaName };
      }
    } catch (err) {
      console.warn("Backend /location/update warning:", err);
    }

    // 2. Client-side Google Geocoder fallback
    if (window.google?.maps?.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const response = await geocoder.geocode({
          location: { lat: latitude, lng: longitude },
        });
        if (response.results && response.results[0]) {
          const result = response.results[0];
          let city = "";
          let area = "";
          for (const comp of result.address_components) {
            if (comp.types.includes("sublocality_level_1") || comp.types.includes("neighborhood")) {
              area = comp.long_name;
            }
            if (comp.types.includes("locality")) {
              city = comp.long_name;
            }
            if (!city && comp.types.includes("administrative_area_level_2")) {
              city = comp.long_name;
            }
          }
          return { city: city || "Jaipur", area: area || result.formatted_address };
        }
      } catch (gErr) {
        console.warn("Google Geocoder warning:", gErr);
      }
    }

    // 3. OpenStreetMap Nominatim fallback
    try {
      const osmRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2`,
        { headers: { "Accept-Language": "en" } }
      );
      if (osmRes.ok) {
        const osmData = await osmRes.json();
        const city = osmData.address?.city || osmData.address?.state_district || osmData.address?.state || "Jaipur";
        const area = osmData.address?.suburb || osmData.address?.neighbourhood || osmData.address?.road || "";
        return { city, area };
      }
    } catch (e) {
      console.warn("Nominatim fallback warning:", e);
    }

    return null;
  };

  // Auto-request location helper (Handles high accuracy + standard fallback)
  const requestCurrentLocation = (isUserInitiated = false) => {
    if (!("geolocation" in navigator)) {
      if (isUserInitiated) setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    setLocationError("");

    const handleSuccess = async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const locResult = await fetchLocationFromCoords(latitude, longitude);

        if (locResult && locResult.city) {
          applyAndSaveLocation(locResult.city, locResult.area);
          setGeoDetectedData(locResult);
        } else if (isUserInitiated) {
          setLocationError("Could not determine area name from GPS coordinates. Please select below.");
        }
      } catch (err) {
        console.error("Location error:", err);
        if (isUserInitiated) setLocationError("Failed to resolve location.");
      } finally {
        setDetectingLocation(false);
      }
    };

    const handleFailure = (err) => {
      console.warn("High accuracy geolocation timed out/denied, trying standard accuracy:", err);
      // Fallback to standard accuracy (non-GPS / Wi-Fi based)
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        (fallbackErr) => {
          setDetectingLocation(false);
          if (isUserInitiated) {
            if (fallbackErr.code === 1) {
              setLocationError("Location permission denied in browser. Please allow permission or select city below.");
            } else if (fallbackErr.code === 3) {
              setLocationError("Location request timed out. Please select your city/area below.");
            } else {
              setLocationError("Unable to retrieve location. Please choose manually below.");
            }
          }
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    };

    // First attempt: High accuracy
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleFailure,
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  };

  // 1. Initial Load: Check saved location OR prompt browser permission auto-fetch
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
      // Prompt browser permission and auto-detect on visit!
      requestCurrentLocation(false);
    }
  }, []);

  // Open modal
  const handleOpenModal = () => {
    setAreaSearchInput("");
    setGooglePredictions([]);
    setLocationError("");
    setTempCityName(selectedCityName !== "Select City" ? selectedCityName : "");
    setTempAreaName(selectedAreaName !== "Select Area" ? selectedAreaName : "");
    setGeoDetectedData(null);
    setLocationModalOpen(true);
  };

  // Universal Apply & Save location
  const applyAndSaveLocation = (cityName, areaName) => {
    const cityToSave = cityName || "Jaipur";
    const areaToSave = areaName || "Select Area";

    setSelectedCityName(cityToSave);
    setSelectedAreaName(areaToSave);

    const locData = { city: cityToSave, area: areaToSave === "Select Area" ? "" : areaToSave };
    localStorage.setItem("user_selected_location", JSON.stringify(locData));
    localStorage.setItem("ats_candidate_city", cityToSave);
    if (locData.area) {
      localStorage.setItem("ats_candidate_location", `${locData.area}, ${cityToSave}`);
    } else {
      localStorage.setItem("ats_candidate_location", cityToSave);
    }

    // Trigger event for other components on the page
    window.dispatchEvent(
      new CustomEvent("ats_location_changed", { detail: locData })
    );

    setLocationModalOpen(false);
  };

  // Select prediction from Google Places
  const handleSelectPrediction = (prediction) => {
    const terms = prediction.terms || [];
    let areaName = prediction.structured_formatting?.main_text || terms[0]?.value || "";
    let cityName = terms[1]?.value || selectedCityName;

    if (terms.length >= 3 && ["Rajasthan", "Delhi", "Karnataka", "Maharashtra", "India"].includes(cityName)) {
      cityName = terms[0]?.value;
    }

    applyAndSaveLocation(cityName, areaName);
  };

  // Select a popular locality chip
  const handleSelectLocality = (city, area) => {
    applyAndSaveLocation(city, area);
  };

  // State -> City -> Area dropdown handlers
  useEffect(() => {
    if (locationModalOpen && activeTab === "manual" && statesList.length === 0) {
      axios
        .get("/location/states")
        .then((res) => {
          if (res.data?.status) setStatesList(res.data.data);
        })
        .catch(() => setLocationError("Failed to fetch states."));
    }
  }, [locationModalOpen, activeTab]);

  const handleStateChange = (e) => {
    const stateUuid = e.target.value;
    setTempStateUuid(stateUuid);
    setTempCityUuid("");
    setTempCityName("");
    setTempAreaName("");
    setCitiesList([]);
    setTownsList([]);

    if (stateUuid) {
      setLoadingCities(true);
      axios
        .get(`/location/cities?state_uuid=${stateUuid}`)
        .then((res) => {
          if (res.data?.status) setCitiesList(res.data.data);
        })
        .finally(() => setLoadingCities(false));
    }
  };

  const handleCityChange = (e) => {
    const cityUuid = e.target.value;
    setTempCityUuid(cityUuid);
    setTempAreaName("");
    setTownsList([]);

    const matchedCity = citiesList.find((c) => c.uuid === cityUuid);
    if (matchedCity) setTempCityName(matchedCity.name);

    if (cityUuid) {
      setLoadingTowns(true);
      axios
        .get(`/location/towns?city_uuid=${cityUuid}`)
        .then((res) => {
          if (res.data?.status) setTownsList(res.data.data);
        })
        .finally(() => setLoadingTowns(false));
    }
  };

  const handleApplyManualLocation = () => {
    applyAndSaveLocation(tempCityName || selectedCityName, tempAreaName || selectedAreaName);
  };

  const isActive = (path) => (path === "/" ? url === "/" : url.startsWith(path));

  const handleLogout = () => {
    setProfileOpen(false);
    router.post(route("logout"));
  };

  const displayName = user?.full_name ? user.full_name.split(" ")[0] : (user?.name ? user.name.split(" ")[0] : "Candidate");
  const initials = displayName ? displayName.substring(0, 2).toUpperCase() : "CA";

  // Auth Button: ONLY ONE dynamic button (no extra buttons)
  const isLoginPage = url.startsWith("/login");
  const authButtonConfig = isLoginPage
    ? { label: "Sign Up", href: "/register" }
    : { label: "Sign In", href: "/login" };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/job-search", label: "Jobs" },
    { href: "/categories", label: "Categories" },
    { href: "/companies", label: "Companies" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="/images/logo.png"
            alt="ATS Logo"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="h-8 w-auto object-contain"
          />
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-gray-900 tracking-tight">
              ATS
            </span>
            <span className="text-xs text-blue-600 font-bold uppercase tracking-wider hidden sm:inline">
              Jobs
            </span>
          </div>
        </Link>

        {/* Center-Left: Location Selector Button */}
        <button
          onClick={handleOpenModal}
          type="button"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100/80 border border-gray-200/60 transition-all text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            {detectingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Navigation className="w-4 h-4 rotate-45 text-blue-600" />
            )}
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 text-xs sm:text-sm">
                {selectedCityName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <span className="text-[11px] text-gray-500 font-medium truncate max-w-[90px] sm:max-w-[130px]">
              {selectedAreaName !== "Select Area" ? selectedAreaName : "Select Locality"}
            </span>
          </div>
        </button>

        {/* Right: Desktop Navigation & Auth */}
        <div className="flex items-center gap-2 ml-auto">
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive(l.href)
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* User Logged In */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-xs font-black">
                    {initials}
                  </div>
                  <span className="hidden sm:inline truncate max-w-[100px]">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-3 border-b border-gray-100 mb-1">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user.full_name || user.name || "Candidate"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {user.phone || user.email}
                        </p>
                      </div>

                      <Link
                        href="/user/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 text-gray-400" /> My Profile
                      </Link>

                      <Link
                        href="/my-applications"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4 text-gray-400" /> My Applications
                      </Link>

                      <Link
                        href="/savedjobs"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <BookmarkCheck className="w-4 h-4 text-gray-400" /> Saved Jobs
                      </Link>

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 w-full text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Guest Auth: ONLY ONE clean button (no extra buttons) */
            <Link
              href={authButtonConfig.href}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs"
            >
              {authButtonConfig.label}
            </Link>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER NAVIGATION */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-gray-800">
                {selectedCityName} {selectedAreaName !== "Select Area" ? `· ${selectedAreaName}` : ""}
              </span>
            </div>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleOpenModal();
              }}
              className="text-xs font-bold text-blue-600 cursor-pointer"
            >
              Change
            </button>
          </div>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive(l.href)
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Guest Auth: Only ONE button */}
          {!user && (
            <div className="pt-2 border-t border-gray-100">
              <Link
                href={authButtonConfig.href}
                onClick={() => setMenuOpen(false)}
                className="w-full block py-2.5 bg-blue-600 text-white text-center rounded-xl text-sm font-bold shadow-xs"
              >
                {authButtonConfig.label}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* LOCATION POPUP MODAL (RENDERED VIA PORTAL DIRECTLY ON DOCUMENT.BODY: NEVER HIDDEN UNDER MAIN PAGE) */}
      {mounted && locationModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setLocationModalOpen(false)}
        >
          <div
            className="relative bg-white w-full max-w-lg my-auto rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col z-10 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600 rotate-45" />
                <h3 className="text-base font-bold text-gray-900">
                  Select Your City & Area
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* 1. GPS Auto-Detect Button */}
              <button
                type="button"
                onClick={() => requestCurrentLocation(true)}
                disabled={detectingLocation}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 font-bold hover:bg-blue-100 transition cursor-pointer disabled:opacity-50 text-sm"
              >
                <div className="flex items-center gap-2.5">
                  {detectingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <Locate className="w-4 h-4 text-blue-600" />
                  )}
                  <span>
                    {detectingLocation ? "Detecting Precise GPS Location..." : "Use My Current Location"}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-blue-600 uppercase">GPS</span>
              </button>

              {/* Detected Geolocation Card */}
              {geoDetectedData && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-800">
                  <div>
                    <span className="font-bold">Detected: </span>
                    {geoDetectedData.city} {geoDetectedData.area ? `· ${geoDetectedData.area}` : ""}
                  </div>
                  <button
                    type="button"
                    onClick={() => applyAndSaveLocation(geoDetectedData.city, geoDetectedData.area)}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
                  >
                    Confirm
                  </button>
                </div>
              )}

              {locationError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                  {locationError}
                </div>
              )}

              {/* Tabs: Live Area Search vs Popular Localities vs State/City Dropdown */}
              <div className="flex border-b border-gray-100 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("search")}
                  className={`pb-2 px-1 border-b-2 transition cursor-pointer ${
                    activeTab === "search"
                      ? "border-blue-600 text-blue-600 font-extrabold"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Area Search (Google)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("popular")}
                  className={`pb-2 px-1 border-b-2 transition cursor-pointer ${
                    activeTab === "popular"
                      ? "border-blue-600 text-blue-600 font-extrabold"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Popular Localities
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("manual")}
                  className={`pb-2 px-1 border-b-2 transition cursor-pointer ${
                    activeTab === "manual"
                      ? "border-blue-600 text-blue-600 font-extrabold"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  State & City List
                </button>
              </div>

              {/* TAB 1: Live Area Search with Google Places Autocomplete */}
              {activeTab === "search" && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={areaSearchInput}
                      onChange={(e) => setAreaSearchInput(e.target.value)}
                      placeholder="Type colony, area or locality (e.g. Vaishali Nagar, Malviya Nagar)..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    {loadingGoogle && (
                      <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                    )}
                  </div>

                  {googlePredictions.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto space-y-1 border border-gray-100 rounded-2xl p-1 bg-white">
                      {googlePredictions.map((pred) => (
                        <button
                          key={pred.place_id}
                          type="button"
                          onClick={() => handleSelectPrediction(pred)}
                          className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-blue-50 text-left transition cursor-pointer group"
                        >
                          <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-600">
                              {pred.structured_formatting?.main_text || pred.description}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">
                              {pred.structured_formatting?.secondary_text || ""}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : areaSearchInput.length >= 2 && !loadingGoogle ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No matching areas found. Try typing a nearby landmark or city name.
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      💡 Start typing any area in India to get live Google Places suggestions.
                    </p>
                  )}
                </div>
              )}

              {/* TAB 2: Popular Localities Chips */}
              {activeTab === "popular" && (
                <div className="space-y-3">
                  {/* City Selector Buttons */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {POPULAR_CITIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setActiveCityTab(c)}
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          activeCityTab === c
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  {/* Localities for active city */}
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Popular Areas in {activeCityTab}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(POPULAR_LOCALITIES_BY_CITY[activeCityTab] || []).map((locality) => (
                        <button
                          key={locality}
                          type="button"
                          onClick={() => handleSelectLocality(activeCityTab, locality)}
                          className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-xl text-xs font-semibold text-gray-700 transition cursor-pointer"
                        >
                          {locality}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: State & City Dropdown fallback */}
              {activeTab === "manual" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                      State
                    </label>
                    <select
                      value={tempStateUuid}
                      onChange={handleStateChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm bg-gray-50 outline-none"
                    >
                      <option value="">Select State</option>
                      {statesList.map((st) => (
                        <option key={st.uuid} value={st.uuid}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                      City
                    </label>
                    <select
                      value={tempCityUuid}
                      onChange={handleCityChange}
                      disabled={!tempStateUuid || loadingCities}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm bg-gray-50 outline-none disabled:opacity-50"
                    >
                      <option value="">
                        {loadingCities ? "Loading cities..." : "Select City"}
                      </option>
                      {citiesList.map((c) => (
                        <option key={c.uuid} value={c.uuid}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {tempCityName && (
                    <button
                      type="button"
                      onClick={handleApplyManualLocation}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs mt-2 cursor-pointer"
                    >
                      Set Location to {tempCityName}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}