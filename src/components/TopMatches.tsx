import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { ConsultantEnum } from '@/lib/api'; // Assuming ConsultantEnum is exported from api

interface ConsultantProfile {
  id: number;
  name: string;
  email: string;
  skills: string[];
  experience: number;
  location: string;
  project: string;
  availability: ConsultantEnum;
  created_at: string;
}

interface Match {
  id: number;
  consultant: ConsultantProfile;
  similarity_score: number;
  rank: number;
}

interface TopMatchesProps {
  candidates: Match[];
}

const TopMatches = ({ candidates }: TopMatchesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="w-5 h-5" />
          <span>Top Matches</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {candidates.map((candidate, index) => (
            <div
              key={candidate.id}
              className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {candidate.consultant.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs text-gray-500 mt-1">#{candidate.rank}</div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{candidate.consultant.name}</h3>
                    <p className="text-sm text-gray-600">{candidate.consultant.project}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${
                      candidate.similarity_score * 100 >= 90
                        ? 'bg-green-100 text-green-800'
                        : candidate.similarity_score * 100 >= 75
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {Math.round(candidate.similarity_score * 100)}% match
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-3">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {candidate.consultant.location}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {candidate.consultant.experience} years
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {candidate.consultant.skills.slice(0, 4).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="text-xs px-2 py-0.5"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {candidate.consultant.skills.length > 4 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      +{candidate.consultant.skills.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopMatches;
