
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Star, Briefcase, Clock } from 'lucide-react';

const ConsultantDetailsModal = ({ consultant, isOpen, onClose }) => {
  if (!consultant) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500';
      case 'Assigned':
        return 'bg-blue-500';
      case 'Unavailable':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{consultant.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{consultant.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{consultant.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{consultant.location}</span>
              </div>
            </div>
            <Badge
              className={`${getStatusColor(consultant.status)} text-white px-3 py-1`}
            >
              {consultant.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Experience</span>
              </div>
              <p className="text-lg font-semibold">{consultant.experience}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">Rating</span>
              </div>
              <p className="text-lg font-semibold">
                {consultant.rating > 0 ? `${consultant.rating}/5` : 'Not rated'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {consultant.skills.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Job Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Currently Assigned:</span>
                  <span className="font-medium">{consultant.assignedJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Jobs:</span>
                  <span className="font-medium">{consultant.completedJobs}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Added:</span>
                  <span className="font-medium">
                    {new Date(consultant.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {consultant.resume && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resume:</span>
                    <span className="font-medium text-blue-600">
                      {consultant.resume}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultantDetailsModal;
