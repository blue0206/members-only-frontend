import { useCallback, useEffect } from "react";
import { useAppSelector } from "@/app/hooks";
import { getTheme } from "@/features/ui/uiSlice";

interface ThemeProviderPropsType {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderPropsType) => {
  const preferredTheme = useAppSelector(getTheme);

  // Apply the new theme if preferredTheme changes.
  const applyTheme = useCallback(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (preferredTheme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add(preferredTheme);
    }
  }, [preferredTheme]);

  // Run applyTheme on mount and when preferredTheme changes.
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // Listen for user's system theme changes.
  useEffect(() => {
    // If the preferred theme is not system, then no need to listen for change.
    if (preferredTheme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = () => {
      // We run applyTheme when the user changes their system theme.
      applyTheme();
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    // Cleanup.
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [preferredTheme, applyTheme]);

  return <>{children}</>;
};
