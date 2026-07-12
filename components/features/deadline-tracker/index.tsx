'use client';

import { useState } from 'react';

interface Deadline {
  id: string;
  program: string;
  deadline: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  status: 'not_started' | 'applied' | 'approved' | 'received';
}

export default function DeadlineTracker() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  const deadlines: Deadline[] = [
    {
      id: '1',
      program: 'FEMA Individual Assistance',
      deadline: '60 days from disaster declaration',
      urgency: 'critical',
      status: 'not_started',
    },
    {
      id: '2',
      program: 'SBA Disaster Home Loan',
      deadline: 'Apply within 60 days',
      urgency: 'high',
      status: 'not_started',
    },
    {
      id: '3',
      program: 'NC Disaster Recovery Program',
      deadline: 'Ongoing - apply as soon as possible',
      urgency: 'medium',
      status: 'not_started',
    },
  ];

  const urgencyColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Deadline Tracker
        </h2>
        <p className="text-gray-600">
          Track your application deadlines and never miss an opportunity
        </p>
      </div>

      {/* Deadline Cards */}
      <div className="space-y-4">
        {deadlines.map((deadline) => (
          <div
            key={deadline.id}
            className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {deadline.program}
                </h3>
                <p className="text-sm text-gray-600">{deadline.deadline}</p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyColors[deadline.urgency]}`}
              >
                {deadline.urgency}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                defaultValue={deadline.status}
              >
                <option value="not_started">Not Started</option>
                <option value="applied">Applied</option>
                <option value="approved">Approved</option>
                <option value="received">Received Funds</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Email Subscription */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Get Deadline Reminders
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          We'll send you email reminders as your deadlines approach
        </p>

        {!subscribed ? (
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        ) : (
          <div className="text-green-700 font-medium">
            ✓ Subscribed! We'll send reminders to {email}
          </div>
        )}
      </div>
    </div>
  );
}
