import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  MapPin,
  Briefcase,
  User,
  Star,
  CheckCircle,
  Clock,
} from "lucide-react";
import { getTop3Matches, getWorkflowStatusByJobDescriptionId } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/components/ui/use-toast";
import apiClient from "@/lib/api";

interface JobDescription {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  skills: string[];
  experience: string;
  created_at: string;
}

interface Match {
  profile: {
    id: number;
    name: string;
    skills: string[];
    experience: number;
    location: string;
    availability: string;
  };
  similarity_score: number;
  rank: number;
  ranked_at?: string;
}

interface WorkflowStatus {
  steps: {
    jd_parsed: boolean;
    profiles_compared: boolean;
    profiles_ranked: boolean;
    notification_sent: boolean;
  };
}

interface JobDetailsModalProps {
  job: JobDescription | null;
  onClose: () => void;
}

const JobDetailsModal = ({ job, onClose }: JobDetailsModalProps) => {
  const [topMatches, setTopMatches] = useState<Match[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (job) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // First try to get top 3 matches
          const [matches, status] = await Promise.all([
            getTop3Matches(job.id),
            getWorkflowStatusByJobDescriptionId(job.id),
          ]);

          // If no matches found, try to generate them
          if (!matches || matches.length === 0) {
            console.log("No matches found, generating matches...");
            try {
              // Call the all-matches endpoint to generate matches
              await apiClient.get(`/match-result/all-matches/${job.id}`);
              // Then get the top 3 matches again
              const newMatches = await getTop3Matches(job.id);
              setTopMatches(newMatches || []);
            } catch (error) {
              console.error("Failed to generate matches:", error);
              toast({
                title: "Error",
                description: "Failed to generate matches. Please try again.",
                variant: "destructive",
              });
            }
          } else {
            setTopMatches(matches);
          }
          setWorkflowStatus(status);
        } catch (error) {
          console.error("Failed to fetch job details", error);
          toast({
            title: "Error",
            description: "Failed to fetch matches. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [job]);

  if (!job) return null;

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="md:col-span-2">
            <h3 className="font-semibold text-lg mb-2">Job Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                <strong>Department:</strong> {job.department}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <strong>Location:</strong> {job.location}
              </div>
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                <strong>Experience:</strong> {job.experience}
              </div>
              <div>
                <strong className="text-md">Description:</strong>
                <p className="text-gray-600 mt-1">{job.description}</p>
              </div>
              <div>
                <strong className="text-md">Skills:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Top Matches</h3>
              {loading ? (
                <p>Loading matches...</p>
              ) : topMatches && topMatches.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {topMatches.map((match, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-5 h-5" />
                            <span>{match.profile?.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>
                              {(match.similarity_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <p>
                            <strong>Experience:</strong>{" "}
                            {match.profile?.experience} years
                          </p>
                          <p>
                            <strong>Location:</strong> {match.profile?.location}
                          </p>
                          <p>
                            <strong>Availability:</strong>{" "}
                            <Badge
                              variant={
                                match.profile?.availability === "available"
                                  ? "success"
                                  : match.profile?.availability === "busy"
                                  ? "warning"
                                  : "destructive"
                              }
                            >
                              {match.profile?.availability}
                            </Badge>
                          </p>
                          <div>
                            <strong>Skills:</strong>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {match.profile?.skills.map((skill: string) => (
                                <Badge key={skill} variant="outline">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p>No matches found for this job description.</p>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-2">Workflow Progress</h3>
            {loading ? (
              <p>Loading status...</p>
            ) : workflowStatus ? (
              <ul className="space-y-3">
                {Object.entries(workflowStatus.steps).map(
                  ([step, completed]) => (
                    <li key={step} className="flex items-center">
                      {completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400 mr-2" />
                      )}
                      <span
                        className={
                          completed ? "text-gray-800" : "text-gray-500"
                        }
                      >
                        {step
                          .replace(/_/g, " ")
                          .replace(/^\w/, (c) => c.toUpperCase())}
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>No workflow status available.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobDetailsModal;
