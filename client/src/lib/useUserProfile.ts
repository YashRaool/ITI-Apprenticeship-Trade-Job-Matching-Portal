import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { studentApi, employerApi } from "./api";

export function useUserProfile() {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);

  const userId = user?.id || (user as any)?.userId;

  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setProfileName(null);
      return;
    }

    if (user.role === "student") {
      studentApi
        .getProfile()
        .then((res) => {
          if (isMounted && res.data?.data?.name) {
            setProfileName(res.data.data.name);
          }
        })
        .catch(() => {});
    } else if (user.role === "employer") {
      employerApi
        .getProfile()
        .then((res) => {
          if (isMounted && res.data?.data?.workshopName) {
            setProfileName(res.data.data.workshopName);
          }
        })
        .catch(() => {});
    } else if (user.role === "admin") {
      setProfileName("Administrator");
    }

    return () => {
      isMounted = false;
    };
  }, [userId, user?.role]);

  const rawName =
    profileName ||
    (user?.email ? user.email.split("@")[0] : "") ||
    (user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` : "User");

  const displayName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : "User";

  const parts = displayName.split(/[\s._-]+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : displayName.slice(0, 2).toUpperCase() || "U";

  return { displayName, initials, user };
}
