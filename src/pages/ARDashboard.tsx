import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Header from "@/components/Header";
import FileUploadForm from "@/components/FileUploadForm";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import JobDescriptionCard from "@/components/JobDescriptionCard";
import JobDetailsModal from "@/components/JobDetailsModal";

interface JobDescription {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  skills: string[];
  experience: string;
  created_at: string;
  workflow?: {
    jdCompared: boolean;
    matchesFound: boolean;
    emailSent: boolean;
  };
}

const fetchJobs = async () => {
  const { data } = await apiClient.get("/job-description/");
  return data;
};

const ARDashboard = () => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: jobs = [],
    isLoading: isJobsLoading,
    isError: isJobsError,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  const addJobMutation = useMutation<
    JobDescription,
    unknown,
    Partial<JobDescription>
  >({
    mutationFn: (jobData) =>
      apiClient.post("/job-description/", jobData).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({ title: "Success", description: "Job created." });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not create job.",
        variant: "destructive",
      });
    },
  });

  const handleFileUploadSubmit = (jobData: Partial<JobDescription>) => {
    console.log("Uploading jobData:", jobData);
    if (jobData && typeof jobData === "object") {
      addJobMutation.mutate(jobData);
    }
    setShowFileUpload(false);
  };

  const handleCloseFileUpload = () => {
    setShowFileUpload(false);
  };

  const handleViewDetails = (job: JobDescription) => {
    setSelectedJob(job);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={localStorage.getItem("userEmail") || "AR User"}
        onLogout={() => {
          localStorage.removeItem("token");
          window.location.href = "/auth";
        }}
        dashboardTitle="AR Dashboard"
      />
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Job Description Management
          </h2>
          <Button onClick={() => setShowFileUpload(true)} variant="secondary">
            <Upload className="w-4 h-4 mr-2" />
            Upload Job File
          </Button>
        </div>
        {showFileUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={handleCloseFileUpload}
              >
                ×
              </button>
              <FileUploadForm
                onSubmit={handleFileUploadSubmit}
                onClose={handleCloseFileUpload}
              />
            </div>
          </div>
        )}
        <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">All Jobs</h3>
          {isJobsLoading ? (
            <p>Loading...</p>
          ) : isJobsError ? (
            <p>Error loading jobs.</p>
          ) : jobs.length === 0 ? (
            <p>No jobs found.</p>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {jobs.map((job: JobDescription) => (
                <li
                  key={job.id}
                  className="py-3 px-2 hover:bg-gray-50 cursor-pointer"
                >
                  <JobDescriptionCard
                    job={job}
                    onViewDetails={handleViewDetails}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default ARDashboard;
