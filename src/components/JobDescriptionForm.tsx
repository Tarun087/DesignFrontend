import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

interface JobDescription {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  skills: string[];
  experience: string;
  created_at: string;
  workflow?: {
    jdCompared: boolean;
    matchesFound: boolean;
    emailSent: boolean;
  };
}

interface JobDescriptionFormProps {
  onSubmit: (jobData: {
    title: string;
    department: string;
    location: string;
    description: string;
    skills: string[];
    experience: string;
  }) => void;
  onClose: () => void;
  editingJob?: JobDescription | null;
}

const JobDescriptionForm = ({ onSubmit, onClose, editingJob }: JobDescriptionFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    description: '',
    experience: '',
  });
  const [skills, setSkills] = useState(['']);

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title,
        department: editingJob.department,
        location: editingJob.location,
        description: editingJob.description,
        experience: editingJob.experience,
      });
      setSkills(editingJob.skills.length > 0 ? editingJob.skills : ['']);
    }
  }, [editingJob]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const filteredSkills = skills.filter(req => req.trim() !== '');
    onSubmit({
      ...formData,
      skills: filteredSkills,
    });
  };

  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index, value) => {
    const updated = [...skills];
    updated[index] = value;
    setSkills(updated);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{editingJob ? 'Edit Job Description' : 'Add New Job Description'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g., 3-5 years"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Skills</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                <Plus className="w-4 h-4 mr-1" />
                Add Skill
              </Button>
            </div>
            <div className="space-y-2">
              {skills.map((req, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={req}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    placeholder="Enter skill"
                  />
                  {skills.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingJob ? 'Update Job Description' : 'Create Job Description'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobDescriptionForm;
