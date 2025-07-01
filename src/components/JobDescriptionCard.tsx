import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, MapPin, Building, DollarSign, Edit, Trash2, Briefcase } from 'lucide-react';

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

interface JobDescriptionCardProps {
  job: JobDescription;
  onViewDetails: (job: JobDescription) => void;
  onEdit: (job: JobDescription) => void;
  onDelete: (id: string) => void;
}

const JobDescriptionCard = ({ job, onViewDetails, onEdit, onDelete }: JobDescriptionCardProps) => {
  const getWorkflowStatus = () => {
    if (!job.workflow) {
      return { status: 'Pending', color: 'bg-gray-400' };
    }
    const { jdCompared, matchesFound, emailSent } = job.workflow;
    if (emailSent) return { status: 'Completed', color: 'bg-green-500' };
    if (matchesFound) return { status: 'Matches Found', color: 'bg-blue-500' };
    if (jdCompared) return { status: 'In Progress', color: 'bg-yellow-500' };
    return { status: 'Pending', color: 'bg-gray-400' };
  };

  const statusInfo = getWorkflowStatus();

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {job.title}
            </CardTitle>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-1" />
                {job.department}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {job.location}
              </div>
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-1" />
                {job.experience}
              </div>
            </div>
          </div>
          <Badge
            className={`${statusInfo.color} text-white px-2 py-1 text-xs`}
          >
            {statusInfo.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Created: {new Date(job.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(job)}
              className="flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(job)}
              className="flex items-center space-x-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(job.id)}
              className="flex items-center space-x-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobDescriptionCard;
