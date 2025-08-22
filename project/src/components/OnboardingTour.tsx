import React, { useEffect, useState } from 'react';

interface OnboardingTourProps {
  onClose: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    setUsers([]);
  }, []);

  const steps = [
    {
      title: 'Welcome to LunchBox Express',
      description: 'Your digital dabbawala service',
      tips: ['Use the navbar to navigate', 'Check notifications for updates']
    },
    {
      title: 'Create Your Profile',
      description: 'Complete your account details',
      tips: ['Add your children', 'Set your address']
    }
  ];

  const currentStepData = steps[step] || steps[0];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{currentStepData.title}</h2>
        <p className="text-gray-600 mb-4">{currentStepData.description}</p>
        <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
          {currentStepData.tips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
        <div className="flex justify-between items-center mt-6">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">Close</button>
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div key={index} className={`w-2 h-2 rounded-full ${index === step ? 'bg-blue-600' : 'bg-gray-300'}`} />
            ))}
          </div>
          <button onClick={() => setStep((s) => (s + 1) % steps.length)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Next</button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;