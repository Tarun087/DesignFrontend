import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConsultantProfile, consultantApi } from '@/lib/consultantApi';
import { useToast } from '@/components/ui/use-toast';

interface ConsultantFormProps {
  onSubmit: (consultant: ConsultantProfile) => void;
  onCancel: () => void;
  initialData?: ConsultantProfile;
}

const ConsultantForm: React.FC<ConsultantFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ConsultantProfile>({
    id: initialData?.id,
    name: '',
    email: '',
    phone: '',
    experience: undefined,
    location: '',
    project: '',
    availability: 'available',
    skills: [''],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Ensure optional fields have default values for the form
        phone: initialData.phone || '',
        location: initialData.location || '',
        project: initialData.project || '',
        skills: initialData.skills.length > 0 ? initialData.skills : [''],
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate mandatory fields
    if (!formData.name || formData.name.length < 1 || formData.name.length > 255) {
      newErrors.name = 'Name is required and must be between 1 and 255 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate optional fields with constraints
    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = 'Phone number must not exceed 20 characters';
    }
    
    if (formData.project && formData.project.length < 10) {
      newErrors.project = 'Project details must be at least 10 characters';
    }
    
    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location must not exceed 100 characters';
    }
    
    // Validate skills
    const filteredSkills = formData.skills.filter(skill => skill.trim() !== '');
    if (filteredSkills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleAvailabilityChange = (value: string) => {
    setFormData(prev => ({ ...prev, availability: value as ConsultantProfile['availability'] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const filteredSkills = formData.skills.filter(skill => skill.trim() !== '');
      
      // Prepare the submission data according to the backend schema
      const submissionData = {
        name: formData.name,
        email: formData.email,
        skills: filteredSkills,
        availability: formData.availability,
        // Optional fields - only include if they have values
        phone: formData.phone || undefined,
        experience: formData.experience ? parseInt(String(formData.experience), 10) : undefined,
        location: formData.location || undefined,
        project: formData.project || undefined,
      };

      console.log('Submitting consultant data:', submissionData);

      let response;
      if (initialData?.id) {
        // Update existing consultant
        console.log(`Updating consultant with ID: ${initialData.id}`);
        await consultantApi.updateConsultant(initialData.id, submissionData);
        response = { ...submissionData, id: initialData.id };
        toast({
          title: "Success",
          description: "Consultant updated successfully",
        });
      } else {
        // Create new consultant
        console.log('Creating new consultant');
        response = await consultantApi.createConsultant(submissionData);
        toast({
          title: "Success",
          description: "Consultant created successfully",
        });
      }
      
      onSubmit(response);
    } catch (error: any) {
      console.error('Error submitting consultant:', error);
      let errorMessage = initialData?.id 
        ? "Failed to update consultant" 
        : "Failed to create consultant";

      if (error.status === 404) {
        errorMessage = "Consultant not found. They may have been deleted.";
      } else if (error.status === 500 && error.data?.detail?.includes('Duplicate entry')) {
        errorMessage = "This email is already registered. Please use a different email address.";
        setErrors(prev => ({
          ...prev,
          email: errorMessage
        }));
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setFormData(prev => {
      const updatedSkills = [...prev.skills];
      updatedSkills[index] = value;
      return { ...prev, skills: updatedSkills };
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{initialData ? 'Edit Consultant' : 'Add New Consultant'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={handleFormChange} 
                required 
                maxLength={255}
                disabled={isSubmitting}
              />
              {errors.name && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.name}</AlertDescription>
                </Alert>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email} 
                onChange={handleFormChange} 
                required 
                disabled={isSubmitting}
              />
              {errors.email && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.email}</AlertDescription>
                </Alert>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={formData.phone} 
                onChange={handleFormChange} 
                maxLength={20}
                placeholder="e.g., +1-555-0000" 
                disabled={isSubmitting}
              />
              {errors.phone && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.phone}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="experience">Experience in Years (Optional)</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience || ''}
                onChange={handleFormChange}
                placeholder="e.g., 5"
                disabled={isSubmitting}
              />
              {errors.experience && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.experience}</AlertDescription>
                </Alert>
              )}
            </div>
            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input 
                id="location" 
                value={formData.location} 
                onChange={handleFormChange} 
                maxLength={100}
                placeholder="e.g., New York, NY" 
                disabled={isSubmitting}
              />
              {errors.location && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.location}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="availability">Availability Status</Label>
            <Select 
              onValueChange={handleAvailabilityChange} 
              value={formData.availability}
              disabled={isSubmitting}
            >
              <SelectTrigger id="availability">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="project">Past Project Details (Optional, min 10 characters)</Label>
            <Textarea
              id="project"
              value={formData.project}
              onChange={handleFormChange}
              placeholder="Describe a recent project the consultant worked on..."
              rows={4}
              minLength={10}
              disabled={isSubmitting}
            />
            {errors.project && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{errors.project}</AlertDescription>
              </Alert>
              )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Skills *</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addSkill}
                disabled={isSubmitting}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Skill
              </Button>
            </div>
            <div className="space-y-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    placeholder="e.g., React, Node.js, Python"
                    required={index === 0}
                    disabled={isSubmitting}
                  />
                  {formData.skills.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(index)}
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.skills && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{errors.skills}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {initialData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                initialData ? 'Update Consultant' : 'Add Consultant'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConsultantForm;
