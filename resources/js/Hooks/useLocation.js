import { useState, useEffect } from "react";

export default function useLocation() {
    const [location, setLocation] = useState(() => {
        // Step 1: Reload / Page move hone par saved location local storage se lein
        const savedLocation = localStorage.getItem("user_location");
        return savedLocation ? JSON.parse(savedLocation) : null;
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            console.log("Location not supported");
            return;
        }

        // Step 2: getCurrentPosition ki jagah watchPosition use karein
        // Yeh tabhi trigger hoga jab user physical location change karega
        const watcher = navigator.geolocation.watchPosition(
            async (position) => {
                const lat = position.coords.latitude.toFixed(3); // Rounding to avoid tiny GPS fluctuation
                const lng = position.coords.longitude.toFixed(3);

                const currentSaved = JSON.parse(localStorage.getItem("user_coords") || "{}");

                // Agar coordinates me major change nahi hai toh API call mat karo
                if (currentSaved.lat === lat && currentSaved.lng === lng) {
                    return;
                }

                try {
                    // Reverse geocode API
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                    );
                    const data = await response.json();

                    const newLocation = {
                        city:
                            data.address.city ||
                            data.address.town ||
                            data.address.village ||
                            data.address.county,
                        state: data.address.state
                    };

                    if (newLocation.city) {
                        setLocation(newLocation);
                        // Local storage me save karein taaki page navigation par change na ho
                        localStorage.setItem("user_location", JSON.stringify(newLocation));
                        localStorage.setItem("user_coords", JSON.stringify({ lat, lng }));
                    }
                } catch (error) {
                    console.error("Geocoding error:", error);
                }
            },
            (error) => {
                console.log("Geolocation error:", error);
            },
            {
                enableHighAccuracy: false,
                maximumAge: 60000, // 1 minute tak cached location use karein
                timeout: 10000
            }
        );

        // Clean up watcher when unmounted
        return () => navigator.geolocation.clearWatch(watcher);
    }, []);

    return location;
}