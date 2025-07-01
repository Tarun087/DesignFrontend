
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const AgentPerformanceCard = ({ agent }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {agent.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Jobs Assigned</span>
            </div>
            <span className="font-semibold text-gray-900">{agent.jobsAssigned}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">Success Rate</span>
            </div>
            <span className="font-semibold text-gray-900">{agent.successRate}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600">Avg Response</span>
            </div>
            <span className="font-semibold text-gray-900">{agent.avgResponseTime}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Rating</span>
            </div>
            <span className="font-semibold text-gray-900">{agent.rating}/5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentPerformanceCard;
