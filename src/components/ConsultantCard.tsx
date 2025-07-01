import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { ConsultantProfile, consultantApi } from "@/lib/consultantApi";
import { useToast } from "@/components/ui/use-toast";
import ConsultantForm from "./ConsultantForm";

interface ConsultantCardProps {
  consultant: ConsultantProfile;
  onUpdate: (updatedConsultant: ConsultantProfile) => void;
  onDelete: (id: number) => void;
}

const ConsultantCard: React.FC<ConsultantCardProps> = ({
  consultant,
  onUpdate,
  onDelete,
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debug log to spot missing id
  if (!consultant.id) {
    console.warn("ConsultantCard: consultant is missing id:", consultant);
  } else {
    console.log(
      "ConsultantCard: consultant with id:",
      consultant.id,
      consultant
    );
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
      case "unavailable":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleUpdate = async (updatedData: ConsultantProfile) => {
    try {
      if (!consultant.id) {
        throw new Error("Consultant ID is missing");
      }

      // Remove the id from the update data to match the backend schema
      const { id, ...updatePayload } = updatedData;

      // Call the API to update the consultant
      await consultantApi.updateConsultant(consultant.id, updatePayload);

      // Update the local state with the new data
      onUpdate({ ...updatePayload, id: consultant.id });
      setIsEditing(false);

      toast({
        title: "Success",
        description: "Consultant updated successfully",
      });
    } catch (error: unknown) {
      console.error("Error updating consultant:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update consultant";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (!consultant.id) {
        throw new Error("Consultant ID is missing");
      }

      setIsDeleting(true);
      await consultantApi.deleteConsultant(consultant.id);
      onDelete(consultant.id);
      toast({
        title: "Success",
        description: "Consultant deleted successfully",
      });
    } catch (error: unknown) {
      console.error("Error deleting consultant:", error);
      const message =
        error instanceof Error ? error.message : "Failed to delete consultant";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <ConsultantForm
        initialData={consultant}
        onSubmit={handleUpdate}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">{consultant.name}</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isDeleting}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  consultant profile for {consultant.name}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm">{consultant.email}</p>
          </div>
          {consultant.phone && (
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-sm">{consultant.phone}</p>
            </div>
          )}
          {consultant.experience !== undefined && (
            <div>
              <p className="text-sm font-medium text-gray-500">Experience</p>
              <p className="text-sm">{consultant.experience} years</p>
            </div>
          )}
          {consultant.location && (
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-sm">{consultant.location}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-500">Availability</p>
            <Badge className={getAvailabilityColor(consultant.availability)}>
              {consultant.availability.charAt(0).toUpperCase() +
                consultant.availability.slice(1)}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Skills</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {consultant.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          {consultant.project && (
            <div>
              <p className="text-sm font-medium text-gray-500">
                Project Details
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {consultant.project}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultantCard;
