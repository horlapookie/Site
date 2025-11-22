
import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  coins: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  autoMonitor: number;
  isAdmin: boolean;
  profileImageUrl?: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    staleTime: 0,
  });

  // If there's an error (including 401), we're not loading anymore
  const actuallyLoading = isLoading && !error;

  return {
    user: user || null,
    isLoading: actuallyLoading,
    isAuthenticated: !!user && !error,
  };
}
