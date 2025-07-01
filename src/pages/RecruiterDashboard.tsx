import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, Briefcase, Clock, TrendingUp, Download, Upload } from 'lucide-react';
import Header from '@/components/Header';
import ConsultantForm from '@/components/ConsultantForm';
import ConsultantCard from '@/components/ConsultantCard';
import ConsultantDetailsModal from '@/components/ConsultantDetailsModal';
import ResumeUploadForm from '@/components/ResumeUploadForm';
import AgentPerformanceCard from '@/components/AgentPerformanceCard';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const fetchConsultants = async () => {
  const { data } = await apiClient.get('/consultant-profile/');
  return data;
};

const RecruiterDashboard = () => {
  const [currentUser, setCurrentUser] = useState('');
  const [showConsultantForm, setShowConsultantForm] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [editingConsultant, setEditingConsultant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setCurrentUser(storedEmail);
    }
  }, []);

  const { data: consultants = [], isLoading, isError } = useQuery({
    queryKey: ['consultants'],
    queryFn: fetchConsultants,
  });

  // Mock data for dashboard stats - will need to be replaced with API calls
  const dashboardStats = {
    totalJobs: 15,
    pendingJobs: 6,
    totalConsultants: consultants.length,
    activeConsultants: consultants.filter(c => c.availability === 'available').length
  };

  const agentPerformance = [
    {
      name: 'Comparison Agent',
      jobsAssigned: 18,
      successRate: 92,
      avgResponseTime: '1.8 hours',
      rating: 4.8
    },
    {
      name: 'Ranking Agent',
      jobsAssigned: 22,
      successRate: 89,
      avgResponseTime: '2.1 hours',
      rating: 4.6
    },
    {
      name: 'Communication Agent',
      jobsAssigned: 16,
      successRate: 94,
      avgResponseTime: '1.5 hours',
      rating: 4.9
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.location.href = '/auth';
  };

  const addConsultantMutation = useMutation({
    mutationFn: (newConsultant) => apiClient.post('/consultant-profile/', newConsultant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      toast({ title: 'Success', description: 'Consultant added.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Could not add consultant.', variant: 'destructive' });
    }
  });

  const updateConsultantMutation = useMutation({
    mutationFn: (updatedConsultant) => apiClient.put(`/consultant-profile/${updatedConsultant.id}`, updatedConsultant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      toast({ title: 'Success', description: 'Consultant updated.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Could not update consultant.', variant: 'destructive' });
    }
  });

  const deleteConsultantMutation = useMutation({
    mutationFn: (consultantId) => apiClient.delete(`/consultant-profile/${consultantId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      toast({ title: 'Success', description: 'Consultant deleted.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Could not delete consultant.', variant: 'destructive' });
    }
  });

  const handleAddConsultant = (consultantData) => {
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
    if (window.confirm('Are you sure you want to delete this consultant?')) {
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
    console.log('Downloading report for:', consultant.name);
    alert(`Downloading assignment report for ${consultant.name}`);
  };

  const filteredConsultants = consultants.filter(consultant =>
    consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultant.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
    consultant.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultant.availability.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} onLogout={handleLogout} dashboardTitle="Recruiter Dashboard" />
      
      <main className="container mx-auto px-6 py-8">
        {!showConsultantForm && !showResumeUpload ? (
          <>
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Briefcase className="w-8 h-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalJobs}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Pending Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingJobs}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Consultants</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalConsultants}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeConsultants}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Consultant Management</h2>
                <p className="text-gray-600 mt-1">
                  Browse, add, and manage consultant profiles
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button onClick={() => setShowResumeUpload(true)} variant="outline">
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
            
            {isLoading && <p>Loading...</p>}
            {isError && <p>Error fetching consultants.</p>}
            {!isLoading && !isError && filteredConsultants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No consultants found
                </h3>
                <p className="text-gray-500">No consultants match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredConsultants.map(consultant => (
                  <ConsultantCard
                    key={consultant.id}
                    consultant={consultant}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEditConsultant}
                    onDelete={handleDeleteConsultant}
                    onDownloadReport={handleDownloadReport}
                  />
                ))}
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Agent Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {agentPerformance.map(agent => (
                  <AgentPerformanceCard key={agent.name} agent={agent} />
                ))}
              </div>
            </div>
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
            {showResumeUpload && <ResumeUploadForm onCancel={handleCloseForm} />}
          </div>
        )}
      </main>

      {selectedConsultant && (
        <ConsultantDetailsModal
          consultant={selectedConsultant}
          onClose={() => setSelectedConsultant(null)}
        />
      )}
    </div>
  );
};

export default RecruiterDashboard;
