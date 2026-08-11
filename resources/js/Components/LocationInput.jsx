import React, { useState, useRef, useEffect, useCallback } from 'react';

const LocationInput = ({ value, onChange, onLatLngChange, placeholder = "Enter location...", variant = "default" }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedLatLng, setSelectedLatLng] = useState(null);
    const inputRef = useRef(null);
    const autocompleteServiceRef = useRef(null);
    const geocoderRef = useRef(null);
    const placesServiceRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const scriptLoadedRef = useRef(false);

    // Google Maps API key from environment
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    // Unique callback name for Google Maps init
    const callbackName = useRef(`initGPlaces_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`).current;

    // Load Google Maps JavaScript API script with Places library
    useEffect(() => {
        if (scriptLoadedRef.current) return;
        if (!GOOGLE_MAPS_API_KEY) {
            setApiError('Google Maps API key not configured in .env (VITE_GOOGLE_MAPS_API_KEY)');
            return;
        }

        // Check if script already exists in DOM
        const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
        if (existingScript) {
            const checkLoaded = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.places) {
                    try {
                        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
                        geocoderRef.current = new window.google.maps.Geocoder();
                        setApiError(null);
                    } catch (err) {
                        console.error('LocationInput: Error initializing Google services:', err);
                    }
                    clearInterval(checkLoaded);
                }
            }, 500);
            setTimeout(() => clearInterval(checkLoaded), 15000);
            scriptLoadedRef.current = true;
            return () => clearInterval(checkLoaded);
        }

        scriptLoadedRef.current = true;

        // Global callback for Google Maps init
        window[callbackName] = () => {
            try {
                if (window.google && window.google.maps && window.google.maps.places) {
                    autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
                    geocoderRef.current = new window.google.maps.Geocoder();
                    setApiError(null);
                } else {
                    console.error('Google Maps loaded but Places library not available');
                    setApiError('Places API not enabled for this key. Enable Places API in Google Cloud Console.');
                }
            } catch (err) {
                console.error('Google Maps init error:', err);
                setApiError('Google Maps init error: ' + err.message);
            }
            delete window[callbackName];
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
            setApiError('Failed to load Google Maps script. Check browser console (F12 > Network tab).');
            scriptLoadedRef.current = false;
            delete window[callbackName];
        };
        document.head.appendChild(script);
    }, [GOOGLE_MAPS_API_KEY, callbackName]);

    const getLocationSuggestions = useCallback((input) => {
        if (input.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (!GOOGLE_MAPS_API_KEY) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        // Use Google Maps Places library if loaded
        if (autocompleteServiceRef.current) {
            setLoading(true);
            autocompleteServiceRef.current.getPlacePredictions(
                {
                    input: input,
                    types: ['geocode'],
                    componentRestrictions: { country: 'in' },
                    language: 'en',
                },
                (predictions, status) => {
                    setLoading(false);
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        const formattedSuggestions = predictions.map(prediction => {
                            const parts = prediction.description.split(',').map(s => s.trim());
                            const locality = parts[0] || '';
                            const city = parts[1] || '';
                            const state = parts[2] || '';
                            return {
                                display_name: prediction.description,
                                place_id: prediction.place_id,
                                type: prediction.types?.[0] || 'location',
                                structured_formatting: prediction.structured_formatting,
                                locality,
                                city,
                                state
                            };
                        });
                        setSuggestions(formattedSuggestions);
                        setShowSuggestions(true);
                    } else {
                        console.warn('Places API status:', status);
                        setSuggestions([]);
                        setShowSuggestions(false);
                    }
                }
            );
            return;
        }

        // Fallback to REST API
        setLoading(true);
        fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&components=country:in&language=en`
        )
        .then(res => res.json())
        .then(data => {
            setLoading(false);
            if (data.status === 'OK' && data.predictions) {
                const formatted = data.predictions.map(prediction => {
                    const parts = prediction.description.split(',').map(s => s.trim());
                    const locality = parts[0] || '';
                    const city = parts[1] || '';
                    const state = parts[2] || '';
                    return {
                        display_name: prediction.description,
                        place_id: prediction.place_id,
                        type: prediction.types?.[0] || 'location',
                        structured_formatting: prediction.structured_formatting,
                        locality, city, state
                    };
                });
                setSuggestions(formatted);
                setShowSuggestions(true);
            } else {
                if (data.status !== 'ZERO_RESULTS') {
                    console.error('Google Maps API error:', data.status, data.error_message);
                    if (data.status === 'REQUEST_DENIED') {
                        setApiError('API key not authorized for Places API. Check Google Cloud Console.');
                    }
                }
                setSuggestions([]);
                setShowSuggestions(false);
            }
        })
        .catch(err => {
            setLoading(false);
            console.error('Error fetching location suggestions:', err);
            setSuggestions([]);
            setShowSuggestions(false);
        });
    }, [GOOGLE_MAPS_API_KEY]);

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        onChange(inputValue);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            getLocationSuggestions(inputValue);
        }, 300);
    };

    const handleSuggestionClick = (suggestion) => {
        onChange(suggestion.display_name);
        setSuggestions([]);
        setShowSuggestions(false);

        // Resolve lat/lng via Geocoder or REST API
        if (geocoderRef.current) {
            geocoderRef.current.geocode(
                { placeId: suggestion.place_id },
                (results, status) => {
                    if (status === 'OK' && results?.[0]?.geometry?.location) {
                        const lat = results[0].geometry.location.lat();
                        const lng = results[0].geometry.location.lng();
                        setSelectedLatLng({ lat, lng });
                        if (onLatLngChange) {
                            onLatLngChange({ latitude: lat, longitude: lng });
                        }
                    }
                }
            );
            return;
        }

        // Fallback: use REST Geocoding API
        fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?place_id=${suggestion.place_id}&key=${GOOGLE_MAPS_API_KEY}`
        )
        .then(res => res.json())
        .then(data => {
            if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
                const { lat, lng } = data.results[0].geometry.location;
                setSelectedLatLng({ lat, lng });
                if (onLatLngChange) {
                    onLatLngChange({ latitude: lat, longitude: lng });
                }
            }
        })
        .catch(err => console.error('Geocoding error:', err));
    };

    const handleBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    const handleFocus = () => {
        if (value && value.length >= 2) {
            getLocationSuggestions(value);
        }
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const location = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                    onChange(location);
                    setSuggestions([]);
                    setShowSuggestions(false);
                    setSelectedLatLng({ lat: latitude, lng: longitude });
                    if (onLatLngChange) {
                        onLatLngChange({ latitude, longitude });
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return (
        <div className="relative" ref={inputRef}>
            <div className="relative">
                {apiError && (
                    <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded mb-1">{apiError}</div>
                )}
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={`w-full outline-none ${
                        variant === 'pill'
                            ? 'bg-transparent px-0 py-0 text-slate-700 placeholder-slate-400 pr-0'
                            : variant === 'hero'
                                ? 'bg-transparent px-0 py-0 text-inherit placeholder-gray-400 pr-8'
                                : variant === 'transparent' 
                                    ? 'bg-transparent px-0 py-0 text-inherit placeholder-gray-500 pr-12' 
                                    : 'px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-12'
                    }`}
                />
                
                {loading && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {variant !== 'hero' && variant !== 'pill' && (
                    <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Use current location"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-[9999] left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto backdrop-blur-sm min-w-[280px]">
                    <div className="py-1">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            >
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            <div className="flex-1 min-w-0">
                                <span className="text-sm text-gray-700 dark:text-gray-300 block truncate">
                                    {suggestion.locality}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {suggestion.city}{suggestion.city && suggestion.state ? ', ' : ''}{suggestion.state}
                                </span>
                            </div>
                            </button>
                        ))}
                    </div>
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Powered by Google Maps
                            </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationInput;