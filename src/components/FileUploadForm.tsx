
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploadFormProps {
  onSubmit: (jobData: {
    title: string;
    department: string;
    location: string;
    description: string;
    requirements: string[];
    salary: string;
  }) => void;
  onClose: () => void;
}

const FileUploadForm = ({ onSubmit, onClose }: FileUploadFormProps) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert('Please select a PDF, TXT, or DOC file');
      }
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    // Simulate file processing - in a real app, this would send the file to a backend service
    setTimeout(() => {
      // Mock extracted data - in a real app, this would come from file parsing
      const mockData = {
        title: 'Extracted Job Title',
        department: 'Engineering',
        location: 'San Francisco, CA',
        description: 'This is the job description extracted from the uploaded file. It contains detailed information about the role, responsibilities, and company culture.',
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          '3+ years of experience in software development',
          'Proficiency in React, JavaScript, and TypeScript',
          'Experience with cloud platforms (AWS, GCP, or Azure)',
          'Strong problem-solving and communication skills'
        ],
        salary: '$80k - $120k'
      };
      
      setExtractedData(mockData);
      setIsProcessing(false);
    }, 2000);
  };

  const handleSubmit = () => {
    if (extractedData) {
      onSubmit(extractedData);
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
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
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
                <span>{isProcessing ? 'Processing...' : 'Process File'}</span>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-2">File Processed Successfully!</h3>
                <p className="text-xs text-green-600">Review the extracted information below and make any necessary adjustments.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Job Title</Label>
                  <p className="text-sm text-gray-700 mt-1">{extractedData.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Department</Label>
                    <p className="text-sm text-gray-700 mt-1">{extractedData.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-sm text-gray-700 mt-1">{extractedData.location}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-gray-700 mt-1">{extractedData.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Requirements</Label>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {extractedData.requirements.map((req, index) => (
                      <li key={index} className="text-sm text-gray-700">{req}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Label className="text-sm font-medium">Salary</Label>
                  <p className="text-sm text-gray-700 mt-1">{extractedData.salary}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Create Job Description
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadForm;
