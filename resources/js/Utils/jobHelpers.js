import { useState, useEffect, useCallback } from "react";

/**
 * Standard Haversine Formula for distance between two points in km
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const numLat1 = parseFloat(lat1);
  const numLon1 = parseFloat(lon1);
  const numLat2 = parseFloat(lat2);
  const numLon2 = parseFloat(lon2);

  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null;
  if (numLat1 === 0 && numLon1 === 0) return null;
  if (numLat2 === 0 && numLon2 === 0) return null;

  const R = 6371; // Radius of the Earth in km
  const dLat = ((numLat2 - numLat1) * Math.PI) / 180;
  const dLon = ((numLon2 - numLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((numLat1 * Math.PI) / 180) *
      Math.cos((numLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  if (d < 1) {
    return `${Math.round(d * 1000)} m away`;
  }
  return `${d.toFixed(1)} km away`;
}

/**
 * Deduce Minimum Qualification from Job Post
 * Levels:
 * 0: Any / Below 10th
 * 1: 10th Pass
 * 2: 12th Pass
 * 3: Diploma / ITI
 * 4: Graduate
 * 5: Post Graduate
 * 6: Doctorate / PhD
 */
export function getJobMinQualification(job) {
  if (!job) return { label: "10th / 12th / Any", level: 1 };

  // If backend provided min_qualification object
  if (job.min_qualification && typeof job.min_qualification === "object" && job.min_qualification.level !== undefined) {
    return job.min_qualification;
  }

  const quals = Array.isArray(job.qualifications)
    ? job.qualifications.join(" ")
    : typeof job.qualifications === "string"
    ? job.qualifications
    : Array.isArray(job.requirements)
    ? job.requirements.join(" ")
    : "";

  const text = (quals + " " + (job.title || "") + " " + (job.description || "")).toLowerCase();

  // 1. Explicit 10th only
  if (
    /(10th\s*pass|10th\s*standard|matric|high\s*school)/i.test(text) &&
    !/(12th|graduate|bachelor|degree|diploma|b\.tech|bca|mca|mba|master)/i.test(text)
  ) {
    return { label: "10th Pass", level: 1 };
  }

  // 2. "10th or 12th"
  if (/10th\s*(pass)?\s*(or|\/)\s*12th/i.test(text)) {
    return { label: "10th Pass", level: 1 };
  }

  // 3. "12th Pass or Graduate" -> minimum is 12th Pass
  if (
    /12th\s*(pass)?\s*(or|\/)\s*(graduate|bachelor|degree)/i.test(text) ||
    (/(12th\s*pass|12th\s*standard|intermediate|senior\s*secondary|10\+2)/i.test(text) &&
      !/(must\s*be\s*graduate|only\s*graduate|degree\s*mandatory)/i.test(text))
  ) {
    return { label: "12th Pass", level: 2 };
  }

  // 4. Diploma / ITI
  if (
    /(diploma|polytechnic|iti)/i.test(text) &&
    !/(only\s*graduate|bachelor\s*mandatory|master\s*only)/i.test(text)
  ) {
    return { label: "Diploma / ITI", level: 3 };
  }

  // 5. Graduate (B.Tech, BCA, B.Com, Degree, Bachelor, or "Bachelor or Master")
  if (/(graduate|bachelor|b\.tech|b\.e|bca|b\.com|b\.sc|bba|degree)/i.test(text)) {
    return { label: "Graduate", level: 4 };
  }

  // 6. Doctorate / PhD
  if (/(phd|doctorate)/i.test(text) && !/(bachelor|graduate|master|bs|ms)/i.test(text)) {
    return { label: "Doctorate / PhD", level: 6 };
  }

  // 7. Post Graduate / Master / MBA
  if (/(master|mba|m\.tech|mca|m\.com|m\.sc|post\s*graduate|pgdm)/i.test(text)) {
    return { label: "Post Graduate", level: 5 };
  }

  return { label: "10th / 12th / Any", level: 1 };
}

/**
 * Deduce Candidate Education Level
 */
export function getCandidateEducation(user) {
  if (!user) return { label: "Not Logged In", level: 0 };

  if (user.education_level && typeof user.education_level === "object" && user.education_level.level !== undefined) {
    return user.education_level;
  }

  let maxLevel = 0;
  let bestLabel = "12th Pass";

  const eduStr = (user.education || "").toLowerCase();
  if (eduStr) {
    if (eduStr.includes("phd") || eduStr.includes("doctor")) {
      maxLevel = Math.max(maxLevel, 6);
      bestLabel = "Doctorate / PhD";
    } else if (
      eduStr.includes("post graduate") ||
      eduStr.includes("master") ||
      eduStr.includes("mba") ||
      eduStr.includes("mca") ||
      eduStr.includes("m.tech") ||
      eduStr.includes("m.com") ||
      eduStr.includes("m.sc")
    ) {
      maxLevel = Math.max(maxLevel, 5);
      bestLabel = "Post Graduate";
    } else if (
      eduStr.includes("graduate") ||
      eduStr.includes("bachelor") ||
      eduStr.includes("b.tech") ||
      eduStr.includes("bca") ||
      eduStr.includes("b.com") ||
      eduStr.includes("bba") ||
      eduStr.includes("b.sc") ||
      eduStr.includes("degree")
    ) {
      maxLevel = Math.max(maxLevel, 4);
      bestLabel = "Graduate";
    } else if (eduStr.includes("diploma") || eduStr.includes("polytechnic") || eduStr.includes("iti")) {
      maxLevel = Math.max(maxLevel, 3);
      bestLabel = "Diploma";
    } else if (
      eduStr.includes("12th") ||
      eduStr.includes("intermediate") ||
      eduStr.includes("10+2") ||
      eduStr.includes("senior secondary")
    ) {
      maxLevel = Math.max(maxLevel, 2);
      bestLabel = "12th Pass";
    } else if (eduStr.includes("10th") || eduStr.includes("matric") || eduStr.includes("high school")) {
      maxLevel = Math.max(maxLevel, 1);
      bestLabel = "10th Pass";
    } else if (eduStr.includes("below")) {
      maxLevel = Math.max(maxLevel, 0);
      bestLabel = "Below 10th";
    }
  }

  if (Array.isArray(user.educations)) {
    user.educations.forEach((edu) => {
      const deg = (edu.degree || "").toLowerCase();
      if (deg.includes("phd") || deg.includes("doctor")) {
        if (6 >= maxLevel) {
          maxLevel = 6;
          bestLabel = edu.degree || "Doctorate";
        }
      } else if (
        deg.includes("master") ||
        deg.includes("mba") ||
        deg.includes("mca") ||
        deg.includes("m.tech") ||
        deg.includes("post graduate")
      ) {
        if (5 >= maxLevel) {
          maxLevel = 5;
          bestLabel = edu.degree || "Post Graduate";
        }
      } else if (
        deg.includes("bachelor") ||
        deg.includes("graduate") ||
        deg.includes("b.tech") ||
        deg.includes("bca") ||
        deg.includes("b.com") ||
        deg.includes("bba") ||
        deg.includes("degree")
      ) {
        if (4 >= maxLevel) {
          maxLevel = 4;
          bestLabel = edu.degree || "Graduate";
        }
      } else if (deg.includes("diploma") || deg.includes("polytechnic") || deg.includes("iti")) {
        if (3 >= maxLevel) {
          maxLevel = 3;
          bestLabel = edu.degree || "Diploma";
        }
      } else if (deg.includes("12th") || deg.includes("inter") || deg.includes("10+2")) {
        if (2 >= maxLevel) {
          maxLevel = 2;
          bestLabel = "12th Pass";
        }
      } else if (deg.includes("10th") || deg.includes("school") || deg.includes("matric")) {
        if (1 >= maxLevel) {
          maxLevel = 1;
          bestLabel = "10th Pass";
        }
      }
    });
  }

  return { label: bestLabel, level: maxLevel };
}

/**
 * Checks Candidate Eligibility for a Job
 */
export function checkJobEligibility(job, user) {
  const minQual = getJobMinQualification(job);

  if (!user) {
    return {
      isEligible: true,
      isRestricted: false,
      jobMinQual: minQual.label,
      jobMinLevel: minQual.level,
      candidateQual: "",
      candidateLevel: 0,
      reason: "",
    };
  }

  const candQual = getCandidateEducation(user);
  const isEligible = candQual.level >= minQual.level;

  return {
    isEligible,
    isRestricted: !isEligible,
    jobMinQual: minQual.label,
    jobMinLevel: minQual.level,
    candidateQual: candQual.label,
    candidateLevel: candQual.level,
    reason: isEligible
      ? `You are eligible (${candQual.label} matches or exceeds ${minQual.label})`
      : `Minimum required qualification is ${minQual.label}. Your profile shows ${candQual.label}. Candidates below minimum qualification cannot apply.`,
  };
}

/**
 * React Hook for User Coordinates and Distance
 */
export function useUserCoords(user = null) {
  const [coords, setCoords] = useState(() => {
    if (typeof window === "undefined") return { latitude: null, longitude: null };

    const storedLat = localStorage.getItem("ats_user_lat");
    const storedLng = localStorage.getItem("ats_user_lng");
    if (storedLat && storedLng) {
      return { latitude: parseFloat(storedLat), longitude: parseFloat(storedLng) };
    }

    if (user?.latitude && user?.longitude) {
      return { latitude: parseFloat(user.latitude), longitude: parseFloat(user.longitude) };
    }
    if (user?.web_latitude && user?.web_longitude) {
      return { latitude: parseFloat(user.web_latitude), longitude: parseFloat(user.web_longitude) };
    }

    return { latitude: null, longitude: null };
  });

  useEffect(() => {
    const handleLocationChange = (e) => {
      const detail = e.detail;
      if (detail && detail.latitude && detail.longitude) {
        setCoords({
          latitude: parseFloat(detail.latitude),
          longitude: parseFloat(detail.longitude),
        });
      } else {
        const storedLat = localStorage.getItem("ats_user_lat");
        const storedLng = localStorage.getItem("ats_user_lng");
        if (storedLat && storedLng) {
          setCoords({ latitude: parseFloat(storedLat), longitude: parseFloat(storedLng) });
        }
      }
    };

    window.addEventListener("ats_location_changed", handleLocationChange);

    // Passive GPS check if permission is already granted and no coords
    if (typeof window !== "undefined" && !coords.latitude && navigator.permissions && navigator.geolocation) {
      navigator.permissions.query({ name: "geolocation" }).then((perm) => {
        if (perm.state === "granted") {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              localStorage.setItem("ats_user_lat", String(latitude));
              localStorage.setItem("ats_user_lng", String(longitude));
              setCoords({ latitude, longitude });
            },
            () => {},
            { timeout: 5000, maximumAge: 600000 }
          );
        }
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener("ats_location_changed", handleLocationChange);
    };
  }, []);

  const getDistanceTo = useCallback(
    (targetLat, targetLng) => {
      if (!coords.latitude || !coords.longitude || !targetLat || !targetLng) return null;
      return calculateDistanceKm(coords.latitude, coords.longitude, targetLat, targetLng);
    },
    [coords.latitude, coords.longitude]
  );

  return { coords, getDistanceTo };
}

