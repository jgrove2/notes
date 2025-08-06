import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

// const API_BASE_URL = "https://notes-backend-bjxn.onrender.com";
const API_BASE_URL = "http://localhost:8080";

export interface UserProfile {
  userId: number;
  firstName: string;
  lastName: string;
  lastModifiedDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  kindeUserId: string;
}

export interface CreateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface FileStructureResponse {
  fileStructure: Record<string, string | null>;
  noteCount: number;
  userId: number;
}

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> {
  if (!token) {
    throw new Error("No access token available");
  }

  console.log("token", token);

  // Prepare headers
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };

  // Don't set Content-Type for FormData (browser will set it automatically with boundary)
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

export async function getAccessToken(): Promise<string | null> {
  // Try to get the access token from the Kinde SDK if available in the browser
  if (typeof window !== "undefined") {
    // @ts-ignore
    if (window.KindeSDK && typeof window.KindeSDK.getToken === "function") {
      try {
        // @ts-ignore
        const token = await window.KindeSDK.getToken();
        return token || null;
      } catch (error) {
        console.error("Error getting access token from KindeSDK:", error);
        return null;
      }
    }
  }
  // Fallback: no token available
  return null;
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await fetchWithAuth("/user/profile");

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
}

export async function createUserProfile(
  profileData: CreateProfileRequest
): Promise<UserProfile> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error("No access token available");
  }

  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status
    );
  }

  return response.json();
}

export async function fetchFileStructure(
  token: string
): Promise<FileStructureResponse> {
  const response = await fetchWithAuth("/notes/structure", {}, token);

  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status
    );
  }

  return response.json();
}

export async function fetchNote(filename: string, token: string): Promise<any> {
  const response = await fetchWithAuth(`/notes/${filename}`, {}, token);

  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status
    );
  }

  return response.json();
}

export async function saveNote(
  filename: string,
  content: any,
  token: string
): Promise<void> {
  console.log("saveNote API called with:", {
    filename,
    content,
    token: token ? "present" : "missing",
  });

  // Create a JSON blob from the content
  const jsonBlob = new Blob([JSON.stringify(content, null, 2)], {
    type: "application/json",
  });

  // Create FormData with file and filename
  const formData = new FormData();
  formData.append("file", jsonBlob, `${filename}.json`);
  formData.append("filename", filename);

  console.log("FormData created:", { filename, blobSize: jsonBlob.size });

  const response = await fetchWithAuth(
    `/notes`,
    {
      method: "PUT",
      body: formData,
    },
    token
  );

  console.log("API response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API error response:", errorText);
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status
    );
  }

  console.log("saveNote completed successfully");
}

export async function createNote(
  filename: string,
  content: any,
  token: string
): Promise<void> {
  // Create a JSON blob from the content
  const jsonBlob = new Blob([JSON.stringify(content, null, 2)], {
    type: "application/json",
  });

  // Create FormData with file and filename
  const formData = new FormData();
  formData.append("file", jsonBlob, `${filename}.json`);
  formData.append("filename", filename);

  const response = await fetchWithAuth(
    `/notes`,
    {
      method: "POST",
      body: formData,
    },
    token
  );

  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status
    );
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}
