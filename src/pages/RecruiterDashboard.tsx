import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  Download,
  Upload,
} from "lucide-react";
import Header from "@/components/Header";
import ConsultantForm from "@/components/ConsultantForm";
import ConsultantCard from "@/components/ConsultantCard";
import ConsultantDetailsModal from "@/components/ConsultantDetailsModal";
import ResumeUploadForm from "@/components/ResumeUploadForm";
import AgentPerformanceCard from "@/components/AgentPerformanceCard";
import apiClient from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ConsultantProfile } from "@/lib/consultantApi";
import { getAllJobs, getPendingJobs } from "@/lib/api";
import JobDetailsModal from "@/components/JobDetailsModal";
import JobDescriptionForm from "@/components/JobDescriptionForm";
import JobDescriptionCard from "@/components/JobDescriptionCard";

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

const fetchConsultants = async () => {
  const { data } = await apiClient.get("/consultant-profile/");
  return data;
};

const RecruiterDashboard = () => {
  const [currentUser, setCurrentUser] = useState("");
  const [showConsultantForm, setShowConsultantForm] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [editingConsultant, setEditingConsultant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showJobsModal, setShowJobsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobDescription | null>(null);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [isAgentPerformanceLoading, setIsAgentPerformanceLoading] =
    useState(true);
  const [isAgentPerformanceError, setIsAgentPerformanceError] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setCurrentUser(storedEmail);
    }
  }, []);

  const {
    data: jobs = [],
    isLoading: isJobsLoading,
    isError: isJobsError,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  const {
    data: consultants = [],
    isLoading: isConsultantsLoading,
    isError: isConsultantsError,
  } = useQuery({
    queryKey: ["consultants"],
    queryFn: fetchConsultants,
  });

  const dashboardStats = {
    totalJobs: jobs.length,
    pendingJobs: jobs.filter((job) => job.status === "pending").length,
    totalConsultants: consultants.length,
    activeConsultants: consultants.filter((c) => c.availability === "available")
      .length,
  };

  useEffect(() => {
    const fetchAgentPerformance = async () => {
      setIsAgentPerformanceLoading(true);
      setIsAgentPerformanceError(false);
      try {
        // TODO: Replace with real backend endpoint when available
        // const response = await apiClient.get("/agent-performance");
        // setAgentPerformance(response.data);
        // Mocked data for now:
        setAgentPerformance([
          {
            name: "Comparison Agent",
            jobsAssigned: 18,
            successRate: 92,
            avgResponseTime: "1.8 hours",
            rating: 4.8,
          },
          {
            name: "Ranking Agent",
            jobsAssigned: 22,
            successRate: 89,
            avgResponseTime: "2.1 hours",
            rating: 4.6,
          },
          {
            name: "Communication Agent",
            jobsAssigned: 16,
            successRate: 94,
            avgResponseTime: "1.5 hours",
            rating: 4.9,
          },
        ]);
      } catch (error) {
        setIsAgentPerformanceError(true);
      } finally {
        setIsAgentPerformanceLoading(false);
      }
    };
    fetchAgentPerformance();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    window.location.href = "/auth";
  };

  const addConsultantMutation = useMutation<
    ConsultantProfile,
    unknown,
    ConsultantProfile
  >({
    mutationFn: (newConsultant: ConsultantProfile) =>
      apiClient
        .post("/consultant-profile/", newConsultant)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultants"] });
      toast({ title: "Success", description: "Consultant added." });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not add consultant.",
        variant: "destructive",
      });
    },
  });

  const updateConsultantMutation = useMutation<
    ConsultantProfile,
    unknown,
    ConsultantProfile
  >({
    mutationFn: (updatedConsultant: ConsultantProfile) =>
      apiClient
        .put(`/consultant-profile/${updatedConsultant.id}`, updatedConsultant)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultants"] });
      toast({ title: "Success", description: "Consultant updated." });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not update consultant.",
        variant: "destructive",
      });
    },
  });

  const deleteConsultantMutation = useMutation({
    mutationFn: (consultantId) =>
      apiClient.delete(`/consultant-profile/${consultantId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultants"] });
      toast({ title: "Success", description: "Consultant deleted." });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not delete consultant.",
        variant: "destructive",
      });
    },
  });

  const handleAddConsultant = (consultantData: ConsultantProfile) => {
    if (!consultantData.id) {
      toast({
        title: "Error",
        description: "Failed to add consultant: missing ID from backend.",
        variant: "destructive",
      });
      console.warn("Attempted to add consultant without id:", consultantData);
      return;
    }
    if (editingConsultant) {
      const updatedConsultant = { ...consultantData, id: editingConsultant.id };
      updateConsultantMutation.mutate(updatedConsultant);
      setEditingConsultant(null);
    } else {
      addConsultantMutation.mutate(consultantData);
    }
    setShowConsultantForm(false);
    setShowResumeUpload(false);
  };

  const handleEditConsultant = (consultant) => {
    setEditingConsultant(consultant);
    setShowConsultantForm(true);
    setShowResumeUpload(false);
  };

  const handleDeleteConsultant = (id) => {
    if (window.confirm("Are you sure you want to delete this consultant?")) {
      deleteConsultantMutation.mutate(id);
    }
  };

  const handleViewDetails = (consultant) => {
    setSelectedConsultant(consultant);
  };

  const handleCloseForm = () => {
    setShowConsultantForm(false);
    setShowResumeUpload(false);
    setEditingConsultant(null);
  };

  const handleDownloadReport = (consultant) => {
    console.log("Downloading report for:", consultant.name);
    alert(`Downloading assignment report for ${consultant.name}`);
  };

  const filteredConsultants = consultants.filter(
    (consultant) =>
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      consultant.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.availability.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const updateJobMutation = useMutation<
    JobDescription,
    unknown,
    { id: string } & Partial<JobDescription>
  >({
    mutationFn: ({ id, ...jobData }) =>
      apiClient.put(`/job-description/${id}`, jobData).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({ title: "Success", description: "Job updated." });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not update job.",
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/job-description/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({ title: "Success", description: "Job deleted." });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not delete job.",
        variant: "destructive",
      });
    },
  });

  const handleAddJob = () => {
    setEditingJob(null);
    setShowJobForm(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      deleteJobMutation.mutate(id);
    }
  };

  const handleSubmitJob = (jobData: Partial<JobDescription> | null) => {
    if (!jobData || typeof jobData !== "object") return;
    if (editingJob && editingJob.id) {
      updateJobMutation.mutate({ id: editingJob.id, ...jobData });
    } else {
      addJobMutation.mutate(jobData);
    }
    setShowJobForm(false);
    setEditingJob(null);
  };

  const handleCloseJobForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        dashboardTitle="Recruiter Dashboard"
      />

      <main className="container mx-auto px-6 py-8">
        {!showConsultantForm && !showResumeUpload ? (
          <>
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div
                className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:bg-blue-50"
                onClick={() => setShowJobsModal(true)}
                title="View all jobs"
              >
                <div className="flex items-center">
                  <Briefcase className="w-8 h-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isJobsLoading
                        ? "..."
                        : isJobsError
                        ? "Error"
                        : dashboardStats.totalJobs}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Pending Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isJobsLoading
                        ? "..."
                        : isJobsError
                        ? "Error"
                        : dashboardStats.pendingJobs}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Consultants</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isConsultantsLoading
                        ? "..."
                        : isConsultantsError
                        ? "Error"
                        : dashboardStats.totalConsultants}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {isConsultantsLoading
                        ? "..."
                        : isConsultantsError
                        ? "Error"
                        : dashboardStats.activeConsultants}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Consultant Management
                </h2>
                <p className="text-gray-600 mt-1">
                  Browse, add, and manage consultant profiles
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setShowResumeUpload(true)}
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resumes
                </Button>
                <Button onClick={() => setShowConsultantForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Consultant
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, skills, location, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isConsultantsLoading && <p>Loading...</p>}
            {isConsultantsError && <p>Error fetching consultants.</p>}
            {!isConsultantsLoading &&
            !isConsultantsError &&
            filteredConsultants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No consultants found
                </h3>
                <p className="text-gray-500">
                  No consultants match your search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConsultants.map((consultant: ConsultantProfile) => (
                  <ConsultantCard
                    key={consultant.id}
                    consultant={consultant}
                    onUpdate={handleEditConsultant}
                    onDelete={handleDeleteConsultant}
                  />
                ))}
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Agent Performance
              </h3>
              {isAgentPerformanceLoading ? (
                <p>Loading agent performance...</p>
              ) : isAgentPerformanceError ? (
                <p>Error loading agent performance.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {agentPerformance.map((agent) => (
                    <AgentPerformanceCard key={agent.name} agent={agent} />
                  ))}
                </div>
              )}
            </div>

            {/* Jobs Modal */}
            {showJobsModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowJobsModal(false)}
                  >
                    ×
                  </button>
                  <h2 className="text-xl font-bold mb-4">All Jobs</h2>
                  {isJobsLoading ? (
                    <p>Loading...</p>
                  ) : isJobsError ? (
                    <p>Error loading jobs.</p>
                  ) : jobs.length === 0 ? (
                    <p>No jobs found.</p>
                  ) : (
                    <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                      {jobs.map((job) => (
                        <li
                          key={job.id}
                          className="py-3 px-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <JobDescriptionCard
                            job={job}
                            onViewDetails={() => {
                              setSelectedJob(job);
                              setShowJobsModal(false);
                            }}
                            onEdit={handleEditJob}
                            onDelete={handleDeleteJob}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Job Form Modal */}
            {showJobForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    onClick={handleCloseJobForm}
                  >
                    ×
                  </button>
                  <JobDescriptionForm
                    onSubmit={handleSubmitJob}
                    onClose={handleCloseJobForm}
                    editingJob={editingJob}
                  />
                </div>
              </div>
            )}

            {/* Job Details Modal */}
            {selectedJob && (
              <JobDetailsModal
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
              />
            )}
          </>
        ) : (
          <div>
            <Button onClick={handleCloseForm} variant="ghost" className="mb-4">
              Cancel
            </Button>
            {showConsultantForm && (
              <ConsultantForm
                onSubmit={handleAddConsultant}
                initialData={editingConsultant}
                onCancel={handleCloseForm}
              />
            )}
            {showResumeUpload && (
              <ResumeUploadForm
                onSubmit={handleAddConsultant}
                onClose={handleCloseForm}
              />
            )}
          </div>
        )}
      </main>

      {selectedConsultant && (
        <ConsultantDetailsModal
          consultant={selectedConsultant}
          isOpen={Boolean(selectedConsultant)}
          onClose={() => setSelectedConsultant(null)}
        />
      )}
    </div>
  );
};

export default RecruiterDashboard;
