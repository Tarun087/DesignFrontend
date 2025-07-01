import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, FileText } from "lucide-react";

const ResumeUploadForm = ({ onSubmit, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert("Please select a PDF, TXT, or DOC file");
      }
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    const formData = new FormData();
    formData.append("files", selectedFile);

    try {
      const response = await fetch(
        "http://localhost:8000/api/consultant-profile/upload-pdfs/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process resume");
      }

      const data = await response.json();
      // Assuming backend returns: { message: "...", results: [{filename: ..., ...extractedData}] }
      const extracted =
        data.results && data.results[0] && Object.values(data.results[0])[0];
      setExtractedData(extracted);
    } catch (error) {
      alert("Error processing resume: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (extractedData) {
      // Transform extractedData to match backend schema
      const transformedData = {
        ...extractedData,
        experience: extractedData.experience
          ? parseInt(String(extractedData.experience).replace(/[^0-9]/g, "")) ||
            undefined
          : undefined,
        skills: Array.isArray(extractedData.skills)
          ? extractedData.skills
          : extractedData.skills
          ? [extractedData.skills]
          : [],
        availability: extractedData.availability || "available",
      };
      try {
        // POST to backend to create consultant and get the object with id
        const response = await fetch(
          "http://localhost:8000/api/consultant-profile/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(transformedData),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to add consultant");
        }
        const createdConsultant = await response.json();
        onSubmit(createdConsultant);
      } catch (error) {
        alert("Error adding consultant: " + error.message);
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upload Resume</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {!extractedData ? (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="resume-upload">
                  Select Resume (PDF, TXT, DOC)
                </Label>
                <div className="mt-2">
                  <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {selectedFile && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={processFile}
                disabled={!selectedFile || isProcessing}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>{isProcessing ? "Processing..." : "Process Resume"}</span>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  Resume Processed Successfully!
                </h3>
                <p className="text-xs text-green-600">
                  Review the extracted information below and make any necessary
                  adjustments.
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-gray-700 mt-1">
                      {extractedData.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-gray-700 mt-1">
                      {extractedData.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm text-gray-700 mt-1">
                      {extractedData.phone}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Experience</Label>
                    <p className="text-sm text-gray-700 mt-1">
                      {extractedData.experience}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {extractedData.location}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {extractedData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Add Consultant</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUploadForm;
