import React, { createContext, useContext, useEffect, useState } from "react";
import { apiCall, removeAuthToken, getAuthToken } from "../lib/api";

export interface User {
    uid: string;
    email: string;
    displayName?: string;
    role?: "farmer" | "customer";
    location?: { lat: number; lng: number } | null;
    photoURL?: string;
}

type UserRole = "farmer" | "customer" | null;

interface AuthContextType {
    user: User | null;
    userRole: UserRole;
    loading: boolean;
    signOut: () => void;
    login: (userData: User) => void;
    signup: (userData: User) => void;
    setUserRole: (role: UserRole) => void;
    updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userRole: null,
    loading: true,
    signOut: () => { },
    login: () => { },
    signup: () => { },
    setUserRole: () => { },
    updateProfile: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRoleState] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    const profile = await apiCall("/profile");
                    const userData: User = {
                        uid: profile._id,
                        email: profile.email,
                        displayName: profile.name,
                        role: profile.role,
                        location: profile.location && profile.location.coordinates ? {
                            lng: profile.location.coordinates[0],
                            lat: profile.location.coordinates[1]
                        } : null
                    };
                    setUser(userData);
                    setUserRoleState(userData.role || null);
                } catch (err) {
                    console.error("Failed to load profile:", err);
                    removeAuthToken();
                }
            }
            setLoading(false);
        };
        loadProfile();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        setUserRoleState(userData.role || null);
    };

    const signup = (userData: User) => {
        login(userData);
    };

    const signOut = () => {
        setUser(null);
        setUserRoleState(null);
        removeAuthToken();
    };

    const setUserRole = (role: UserRole) => {
        setUserRoleState(role);
        if (user) {
            setUser({ ...user, role: role || undefined });
        }
    }

    const updateProfile = (data: Partial<User>) => {
        if (!user) return;
        setUser({ ...user, ...data });
    }

    return (
        <AuthContext.Provider value={{ user, userRole, loading, signOut, login, signup, setUserRole, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
