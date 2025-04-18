import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { Power } from "lucide-react";

interface TopBarProps {
  isLoginPage?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ isLoginPage = false }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Sprawdź stan sesji przy montowaniu komponentu
    const checkSession = async () => {
      try {
        console.log("Checking session...");
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });
        const data = await response.json();
        console.log("Session check result:", data);
        setIsLoggedIn(!!data.session);
      } catch (error) {
        console.error("Session check error:", error);
        setIsLoggedIn(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-gray-900">
              10xDevs Audits
            </a>
          </div>

          <div className="flex items-center">
            {!isCheckingSession &&
              (isLoggedIn ? (
                <Button
                  onClick={handleLogout}
                  disabled={isLoading}
                  variant="ghost"
                  className="h-12 w-12 p-0 flex items-center justify-center"
                >
                  <Power className="h-7 w-7" />
                  <span className="sr-only">Wyloguj się</span>
                </Button>
              ) : (
                !isLoginPage && (
                  <a
                    href="/auth/login"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Zaloguj się
                  </a>
                )
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
