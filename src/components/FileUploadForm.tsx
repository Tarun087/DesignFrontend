import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, FileText } from "lucide-react";

interface FileUploadFormProps {
  onSubmit: (jobData: {
    title: string;
    department: string;
    location: string;
    description: string;
    experience: string;
    skills: string[];
  }) => void;
  onClose: () => void;
}

interface ExtractedJobData {
  title?: string;
  department?: string;
  location?: string;
  description?: string;
  experience?: string;
  skills?: string[];
  [key: string]: unknown;
}

const FileUploadForm = ({ onSubmit, onClose }: FileUploadFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedJobData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Please select a PDF, TXT, or DOC file");
      }
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("files", selectedFile);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8000/api/job-description/upload-job-descriptions/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Failed to process file");
      }
      const data = await response.json();
      // Assume backend returns: { message: ..., results: [{filename: ..., ...extractedData}] }
      const firstResult = data.results && data.results[0];
      const extracted =
        firstResult && (Object.values(firstResult)[0] as ExtractedJobData);
      setExtractedData(extracted);
    } catch (err: unknown) {
      setError((err as Error).message || "Error processing file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (extractedData) {
      // Map backend fields to jobData for final submission
      const jobData = {
        title: extractedData.title || "",
        department: extractedData.department || "",
        location: extractedData.location || "",
        description: extractedData.description || "",
        experience: extractedData.experience || "",
        skills: extractedData.skills || [],
      };
      onSubmit(jobData);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upload Job Description File</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {!extractedData ? (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select File (PDF, TXT, DOC)</Label>
                <div className="mt-2">
                  <Input
                    id="file-upload"
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
                <span>{isProcessing ? "Processing..." : "Process File"}</span>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  File Processed Successfully!
                </h3>
                <p className="text-xs text-green-600">
                  Review the extracted information below and make any necessary
                  adjustments.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Job Title</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {extractedData.title}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Department</Label>
                    <p className="text-sm text-gray-700 mt-1">
                      {extractedData.department}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-sm text-gray-700 mt-1">
                      {extractedData.location}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {extractedData.description}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Experience</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {extractedData.experience}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Skills</Label>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {(extractedData.skills || []).map(
                      (skill: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700">
                          {skill}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Create Job Description</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadForm;
