import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Briefcase, Upload, FileText, Search } from 'lucide-react';
import Header from '@/components/Header';
import JobDescriptionForm from '@/components/JobDescriptionForm';
import FileUploadForm from '@/components/FileUploadForm';
import JobDescriptionCard from '@/components/JobDescriptionCard';
import JobDetailsModal from '@/components/JobDetailsModal';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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

const fetchJobDescriptions = async () => {
  const { data } = await apiClient.get('/job-description/');
  return data;
};

const Index = () => {
  const [currentUser, setCurrentUser] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null);
  const [editingJob, setEditingJob] = useState<JobDescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setCurrentUser(storedEmail);
    }
  }, []);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobDescriptions = [], isLoading, isError } = useQuery({
    queryKey: ['jobDescriptions'],
    queryFn: fetchJobDescriptions,
  });

  const addJobMutation = useMutation({
    mutationFn: (newJob) => apiClient.post('/job-description/', newJob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobDescriptions'] });
      toast({ title: 'Success', description: 'Job description added.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Could not add job description.', variant: 'destructive' });
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: (updatedJob: JobDescription) => apiClient.put(`/job-description/${updatedJob.id}`, updatedJob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobDescriptions'] });
      toast({ title: 'Success', description: 'Job description updated.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Could not update job description.', variant: 'destructive' });
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: (jobId) => apiClient.delete(`/job-description/${jobId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobDescriptions'] });
      toast({ title: 'Success', description: 'Job description deleted.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Could not delete job description.', variant: 'destructive' });
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.location.href = '/auth';
  };

  const handleAddJob = (jobData) => {
    if (editingJob) {
      updateJobMutation.mutate({ ...editingJob, ...jobData });
      setEditingJob(null);
    } else {
      addJobMutation.mutate(jobData);
    }
    setShowForm(false);
    setShowFileUpload(false);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowForm(true);
    setShowFileUpload(false);
  };

  const handleDeleteJob = (id) => {
    if (window.confirm('Are you sure you want to delete this job description?')) {
      deleteJobMutation.mutate(id);
    }
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setShowFileUpload(false);
    setEditingJob(null);
  };

  const filteredJobs = jobDescriptions.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.skills && job.skills.some(req => req.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    new Date(job.created_at).toLocaleDateString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} onLogout={handleLogout} dashboardTitle="AR Requestor Dashboard" />
      
      <main className="container mx-auto px-6 py-8">
        {!showForm && !showFileUpload ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Intelligent Document Processing</h2>
                <p className="text-gray-600 mt-1">
                  Automatically compare job descriptions and resumes to find the top matches for your roles.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setShowFileUpload(true)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </Button>
                <Button
                  onClick={() => setShowForm(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Job Description</span>
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title, department, location, skills, or created date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading && <p>Loading...</p>}
            {isError && <p>Error fetching job descriptions.</p>}
            {!isLoading && !isError && filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No job descriptions found' : 'No job descriptions yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Get started by creating your first job description or uploading a file'
                  }
                </p>
                {!searchTerm && (
                  <div className="flex items-center justify-center space-x-3">
                    <Button onClick={() => setShowFileUpload(true)} variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Job Description
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <JobDescriptionCard
                    key={job.id}
                    job={job}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEditJob}
                    onDelete={handleDeleteJob}
                  />
                ))}
              </div>
            )}
          </>
        ) : showFileUpload ? (
          <div className="max-w-4xl mx-auto">
            <FileUploadForm
              onSubmit={handleAddJob}
              onClose={handleCloseForm}
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <JobDescriptionForm
              onSubmit={handleAddJob}
              onClose={handleCloseForm}
              editingJob={editingJob}
            />
          </div>
        )}
      </main>

      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
};

export default Index;
