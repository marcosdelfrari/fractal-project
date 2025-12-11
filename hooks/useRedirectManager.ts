// *********************
// Role of the hook: Manages redirects and route access based on authentication state
// Name of the hook: useRedirectManager.ts
// Version: 1.0
// Hook call: const { redirectToDashboard, ... } = useRedirectManager()
// Output: object with redirect functions and state
// *********************

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

// Routes configuration
const ROUTES = {
  PUBLIC: ["/", "/promo", "/shop", "/product", "/login", "/register"],
  AUTHENTICATED: ["/cart", "/checkout", "/wishlist", "/profile"],
  USER: ["/user"],
  ADMIN: ["/admin"],
} as const;

export const useRedirectManager = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === "authenticated" && !!session;
  const isLoading = status === "loading";
  const userRole = (session?.user as any)?.role || "guest";

  // Check if user can access a specific route
  const canAccessRoute = useCallback(
    (route: string): boolean => {
      // Public routes are always accessible
      if (ROUTES.PUBLIC.some((r) => route.startsWith(r))) {
        return true;
      }

      // Not authenticated - cannot access protected routes
      if (!isAuthenticated) {
        return false;
      }

      // Admin routes - only for admin users
      if (ROUTES.ADMIN.some((r) => route.startsWith(r))) {
        return userRole === "admin";
      }

      // User routes - for user and admin
      if (ROUTES.USER.some((r) => route.startsWith(r))) {
        return userRole === "user" || userRole === "admin";
      }

      // Authenticated routes - any authenticated user
      if (ROUTES.AUTHENTICATED.some((r) => route.startsWith(r))) {
        return true;
      }

      // Default: allow access
      return true;
    },
    [isAuthenticated, userRole]
  );

  // Get appropriate redirect based on user role
  const getAppropriateRedirect = useCallback((): string => {
    if (!isAuthenticated) {
      return "/login";
    }

    if (userRole === "admin") {
      return "/admin";
    }

    if (userRole === "user") {
      return "/user";
    }

    return "/";
  }, [isAuthenticated, userRole]);

  // Basic redirects
  const redirectToHome = useCallback(() => {
    router.push("/");
  }, [router]);

  const redirectToPromo = useCallback(() => {
    router.push("/promo");
  }, [router]);

  const redirectToShop = useCallback(() => {
    router.push("/shop");
  }, [router]);

  const redirectToLogin = useCallback(
    (returnUrl?: string) => {
      const url = returnUrl
        ? `/login?callbackUrl=${encodeURIComponent(returnUrl)}`
        : "/login";
      router.push(url);
    },
    [router]
  );

  const redirectToDashboard = useCallback(() => {
    if (userRole === "admin") {
      router.push("/admin");
    } else if (userRole === "user") {
      router.push("/user");
    } else {
      router.push("/login");
    }
  }, [router, userRole]);

  // Redirect with authentication check
  const redirectWithAuthCheck = useCallback(
    (targetRoute: string) => {
      if (!isAuthenticated) {
        redirectToLogin(targetRoute);
        return;
      }

      if (!canAccessRoute(targetRoute)) {
        // Redirect to appropriate dashboard based on role
        redirectToDashboard();
        return;
      }

      router.push(targetRoute);
    },
    [
      isAuthenticated,
      canAccessRoute,
      redirectToLogin,
      redirectToDashboard,
      router,
    ]
  );

  return {
    // State
    isAuthenticated,
    isLoading,
    userRole,

    // Utilities
    canAccessRoute,
    getAppropriateRedirect,

    // Redirect functions
    redirectToHome,
    redirectToPromo,
    redirectToShop,
    redirectToLogin,
    redirectToDashboard,
    redirectWithAuthCheck,
  };
};

export default useRedirectManager;


