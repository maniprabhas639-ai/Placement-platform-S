// client/src/pages/InterviewCreate.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import InterviewForm from '../components/InterviewForm';
import { toast } from "react-toastify";

export default function InterviewCreate() {
  const navigate = useNavigate();

  async function handleCreate(createdInterview) {
    toast.success("Interview added successfully! 🎉");

    if (createdInterview && createdInterview._id) {
      setTimeout(() => navigate(`/interview/${createdInterview._id}`), 800);
    } else {
      setTimeout(() => navigate('/dashboard'), 800);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#04060a] text-white px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-semibold mb-6">Add Interview</h1>

        <Card className="p-6">
          <InterviewForm
            onCreate={(created) => handleCreate(created)}
            onClose={() => navigate(-1)}
          />
        </Card>
      </div>
    </div>
  );
}
