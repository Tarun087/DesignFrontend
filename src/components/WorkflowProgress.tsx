
import React from 'react';
import { Check, Clock, Mail, Search, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkflowProgressProps {
  workflow: {
    jdCompared: boolean;
    matchesFound: boolean;
    emailSent: boolean;
  };
}

const WorkflowProgress = ({ workflow }: WorkflowProgressProps) => {
  const steps = [
    {
      id: 'jdCompared',
      title: 'JD Compared',
      description: 'Job description analyzed and processed',
      icon: FileText,
      completed: workflow.jdCompared,
    },
    {
      id: 'matchesFound',
      title: 'Matches Found',
      description: 'Potential candidates identified',
      icon: Search,
      completed: workflow.matchesFound,
    },
    {
      id: 'emailSent',
      title: 'Email Sent',
      description: 'Notifications sent to relevant parties',
      icon: Mail,
      completed: workflow.emailSent,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Workflow Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = step.completed;
            const isActive = index === 0 || steps[index - 1].completed;
            
            return (
              <div
                key={step.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                  isCompleted
                    ? 'bg-green-50 border-green-200'
                    : isActive
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      isCompleted
                        ? 'text-green-800'
                        : isActive
                        ? 'text-blue-800'
                        : 'text-gray-600'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      isCompleted
                        ? 'text-green-600'
                        : isActive
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowProgress;
