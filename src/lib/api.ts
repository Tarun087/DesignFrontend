import axios, { AxiosError } from "axios";

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
    });
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("API Response Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export const getTop3Matches = async (jobId: string) => {
  const response = await apiClient.get(`/match/top-3-matches/${jobId}`);
  return response.data;
};

export const getWorkflowStatusByJobId = async (jobId: string) => {
  const response = await apiClient.get(`/workflow/job_description/${jobId}`);
  return response.data;
};

interface Job {
  status: string;
  // Add other fields as needed
}

export const getAllJobs = async () => {
  const response = await apiClient.get("/job-description/");
  return response.data;
};

export const getPendingJobs = async () => {
  const response = await apiClient.get("/job-description/");
  // Filter jobs with status 'pending'
  return response.data.filter((job: Job) => job.status === "pending");
};

export default apiClient;

export enum ConsultantEnum {
  available = "available",
  busy = "busy",
  unavailable = "unavailable",
}
