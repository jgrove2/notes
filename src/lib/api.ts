const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface UserProfile {
  userId: number;
  firstName: string;
  lastName: string;
  lastModifiedDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  kindeUserId: string;
  maxStorage?: number; // bytes
  autoSave?: boolean;
  autoSaveDuration?: number; // seconds
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

export async function fetchNote(
  filename: string,
  token: string
): Promise<string> {
  const response = await fetchWithAuth(
    `/notes/content?filename=${encodeURIComponent(filename)}`,
    {},
    token
  );

  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status
    );
  }

  // File content is returned as text/html
  return response.text();
}

export async function saveNote(
  filename: string,
  content: string,
  token: string
): Promise<void> {
  // Create an HTML blob from the content
  const htmlBlob = new Blob([content], {
    type: "text/html",
  });

  // Create FormData with file and filename
  const formData = new FormData();
  formData.append("file", htmlBlob, `${filename}.html`);
  formData.append("filename", filename);

  const response = await fetchWithAuth(
    `/notes`,
    {
      method: "PUT",
      body: formData,
    },
    token
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API error response:", errorText);
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status
    );
  }
}

export async function createNote(
  filename: string,
  content: string,
  token: string
): Promise<void> {
  // Create an HTML blob from the content
  const htmlBlob = new Blob([content], {
    type: "text/html",
  });

  // Create FormData with file and filename
  const formData = new FormData();
  formData.append("file", htmlBlob, `${filename}.html`);
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
    const errorText = await response.text();
    console.error("API error response:", errorText);
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status
    );
  }
}

export async function listNotes(token: string): Promise<string[]> {
  const response = await fetchWithAuth(`/notes`, {}, token);
  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status
    );
  }
  return response.json();
}

export async function fetchNoteInfo(
  filename: string,
  token: string
): Promise<any> {
  const response = await fetchWithAuth(
    `/notes/info?filename=${encodeURIComponent(filename)}`,
    {},
    token
  );
  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status
    );
  }
  return response.json();
}

export async function deleteNote(
  filename: string,
  token: string
): Promise<void> {
  const response = await fetchWithAuth(
    `/notes?filename=${encodeURIComponent(filename)}`,
    { method: "DELETE" },
    token
  );
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || `HTTP error! status: ${response.status}`,
      response.status
    );
  }
}

export async function renameNote(
  oldFilename: string,
  newFilename: string,
  token: string
): Promise<any> {
  const response = await fetchWithAuth(
    `/notes/rename?oldFilename=${encodeURIComponent(oldFilename)}&newFilename=${encodeURIComponent(newFilename)}`,
    { method: "POST" },
    token
  );
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || `HTTP error! status: ${response.status}`,
      response.status
    );
  }
  return response.json();
}

export async function fetchStorageSize(token: string): Promise<number> {
  const response = await fetchWithAuth(`/notes/storage/size`, {}, token);
  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status
    );
  }

  // Try to parse JSON first, fallback to plain number text
  try {
    const json = await response.json();

    // Prefer explicit total bytes if available
    const totalSizeBytes = (json as any)["totalSizeBytes"];
    if (typeof totalSizeBytes === "number") {
      return totalSizeBytes;
    }

    // Check nested sizeInfo.bytes
    const sizeInfo = (json as any)["sizeInfo"];
    if (sizeInfo && typeof sizeInfo["bytes"] === "number") {
      return sizeInfo["bytes"] as number;
    }

    const possibleKeys = [
      "size",
      "bytes",
      "bytesUsed",
      "storageBytes",
    ] as const;
    for (const key of possibleKeys) {
      const value = (json as any)[key];
      if (typeof value === "number") return value;
      if (typeof value === "string" && !Number.isNaN(Number(value)))
        return Number(value);
    }
  } catch (_e) {
    // ignore and try text
  }

  const text = await response.text();
  const num = Number(text);
  if (!Number.isNaN(num)) return num;

  throw new ApiError("Invalid storage size response", 500);
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
