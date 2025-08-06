import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import {
  fetchUserProfile,
  createUserProfile,
  UserProfile,
  CreateProfileRequest,
  ApiError,
  fetchWithAuth,
} from "~/lib/api";

export function useUserProfile() {
  const { getToken, isAuthenticated } = useKindeAuth();
  return useQuery<UserProfile, ApiError>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      console.log("fetching user profile");
      const token = await getToken();
      const response = await fetchWithAuth("/user/profile", {}, token);
      console.log("response", response);
      if (response.status === 404) {
        throw new ApiError("User profile not found", 404);
      }

      if (!response.ok) {
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      return response.json();
    },
    enabled: isAuthenticated,
    retry: (failureCount, error) => {
      // Don't retry on 404 (user not found in profile service)
      if (error.status === 404) {
        return false;
      }
      // Don't retry on 401 (unauthorized)
      if (error.status === 401) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

// Hook for checking if user profile exists
export function useUserProfileExists() {
  const { data, error, isLoading } = useUserProfile();

  return {
    exists: !error || error.status !== 404,
    isLoading,
    error,
    profile: data,
  };
}

// Hook for getting user profile with fallback handling
export function useUserProfileWithFallback() {
  const { data, error, isLoading, refetch } = useUserProfile();

  const isProfileNotFound = error?.status === 404;
  const isOtherError = error && error.status !== 404;

  return {
    profile: data,
    isLoading,
    isProfileNotFound,
    isOtherError,
    error,
    refetch,
  };
}

// Hook for handling profile with create form fallback
export function useUserProfileWithCreateForm() {
  const { data, error, isLoading, refetch } = useUserProfile();

  const isProfileNotFound = error?.status === 404;
  const isOtherError = error && error.status !== 404;
  const shouldShowCreateForm = isProfileNotFound;

  return {
    profile: data,
    isLoading,
    isProfileNotFound,
    isOtherError,
    shouldShowCreateForm,
    error,
    refetch,
  };
}

// Hook for creating/updating user profile
export function useCreateUserProfile() {
  const { isAuthenticated, getToken } = useKindeAuth();
  const queryClient = useQueryClient();

  return useMutation<UserProfile, ApiError, CreateProfileRequest>({
    mutationFn: async (profileData: CreateProfileRequest) => {
      const token = await getToken();

      if (!token) {
        throw new ApiError("No access token available", 401);
      }

      const response = await fetchWithAuth("/user/profile", {
        method: "POST",
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch the user profile query
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      // Optionally, you can also update the cache directly
      queryClient.setQueryData(["user-profile"], data);
    },
    onError: (error) => {
      console.error("Error creating user profile:", error);
    },
  });
}
