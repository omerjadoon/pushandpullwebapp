'use client';

import React, { useEffect, useState } from 'react';
import { ref, get, push, update } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RequestDetailsProps {
  params: {
    id: string;
  };
}

interface Customer {
  displayName: string;
  email: string;
  mobile: string;
  preferredSlot: string;
  trainerPreferences: {
    first: string;
    second: string;
    third: string;
  };
}

interface Suggestion {
  message: string;
  slot: string;
  trainer: string;
}

interface AcceptedSuggestion {
  id: string;
  message: string;
  slot: string;
  suggestionId: string;
  trainer: string;
}

interface Trainer {
  id: string;
  displayName: string;
}

export default function RequestDetails({ params }: RequestDetailsProps) {
  const { id } = params;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [acceptedSuggestion, setAcceptedSuggestion] = useState<AcceptedSuggestion | null>(null);
  const [moreSuggestionsRequest, setMoreSuggestionsRequest] = useState<string | null>(null);
  const [newSuggestion, setNewSuggestion] = useState<Suggestion>({
    message: '',
    slot: '',
    trainer: '',
  });
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const requestRef = ref(database, `requests/${id}`);
        const requestSnapshot = await get(requestRef);
        const requestData = requestSnapshot.val();

        if (!requestData) {
          setLoading(false);
          return;
        }

        const { customer_id } = requestData;

        // Fetch customer details
        const customerRef = ref(database, `users/${customer_id}`);
        const customerSnapshot = await get(customerRef);
        const customerData = customerSnapshot.val();

        // Fetch suggestions for the customer
        const suggestionsRef = ref(database, `suggestions/users/${customer_id}`);
        const suggestionsSnapshot = await get(suggestionsRef);
        const userSuggestions = suggestionsSnapshot.val()
          ? Object.values(suggestionsSnapshot.val())
          : [];

        // Fetch accepted suggestion for the customer
        const acceptedSuggestionRef = ref(database, `acceptedSuggestions/${customer_id}`);
        const acceptedSuggestionSnapshot = await get(acceptedSuggestionRef);
        const userAcceptedSuggestion = acceptedSuggestionSnapshot.val();

        // Fetch more suggestions request
        const moreSuggestionsRef = ref(database, `requestMoreSuggestions/${customer_id}`);
        const moreSuggestionsSnapshot = await get(moreSuggestionsRef);
        const moreSuggestionsData = moreSuggestionsSnapshot.val();

        // Fetch all trainers
        const usersRef = ref(database, `users`);
        const usersSnapshot = await get(usersRef);
        const usersData = usersSnapshot.val();
        const trainerList = Object.entries(usersData || {})
          .filter(([, user]: [string, any]) => user.role === 'trainer')
          .map(([id, user]: [string, any]) => ({
            id,
            displayName: user.displayName,
          }));

        setCustomer(customerData);
        setSuggestions(userSuggestions as Suggestion[]);
        setAcceptedSuggestion(userAcceptedSuggestion as AcceptedSuggestion);
        setMoreSuggestionsRequest(moreSuggestionsData?.status || null);
        setTrainers(trainerList as Trainer[]);
      } catch (error) {
        console.error('Error fetching request details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);

  const handleAddSuggestion = async () => {
    if (!customer || !newSuggestion.message || !newSuggestion.slot || !newSuggestion.trainer) {
      alert('Please fill in all the fields before adding a suggestion.');
      return;
    }

    try {
      const suggestionsRef = ref(database, `suggestions/users/${id}`);
      await push(suggestionsRef, newSuggestion);
      setSuggestions([...suggestions, newSuggestion]);
      setNewSuggestion({ message: '', slot: '', trainer: '' });
      alert('Suggestion added successfully!');
    } catch (error) {
      console.error('Error adding suggestion:', error);
    }
  };

  const handleUpdateMoreSuggestionsStatus = async (status: string) => {
    if (!customer) return;

    try {
      const moreSuggestionsRef = ref(database, `requestMoreSuggestions/${customer.displayName}`);
      await update(moreSuggestionsRef, { status });
      setMoreSuggestionsRequest(status);
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!customer) {
    return <p>No customer details found.</p>;
  }

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[1080px]">
        <Breadcrumb pageName="Request Details" />
        <div>
          {/* Customer Details */}
          <Card className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Name:</strong> {customer.displayName}</p>
              <p><strong>Email:</strong> {customer.email}</p>
              <p><strong>Mobile:</strong> {customer.mobile}</p>
            </CardContent>
          </Card>

          {/* More Suggestions Status Update */}
          <Card className="rounded-[10px] mt-5 border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
            <CardHeader>
              <CardTitle>Update More Suggestions Request Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button onClick={() => handleUpdateMoreSuggestionsStatus('in progress')}>
                  Mark as In Progress
                </Button>
                <Button onClick={() => handleUpdateMoreSuggestionsStatus('done')}>
                  Mark as Done
                </Button>
              </div>
              <p className="mt-4"><strong>Current Status:</strong> {moreSuggestionsRequest || 'N/A'}</p>
            </CardContent>
          </Card>

          {/* Add Suggestion */}
          <Card className="rounded-[10px] mt-5 border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
            <CardHeader>
              <CardTitle>Add Suggestion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <Input
                  placeholder="Message"
                  value={newSuggestion.message}
                  onChange={(e) => setNewSuggestion({ ...newSuggestion, message: e.target.value })}
                />
                <Input
                  placeholder="Slot (e.g., morning, afternoon)"
                  value={newSuggestion.slot}
                  onChange={(e) => setNewSuggestion({ ...newSuggestion, slot: e.target.value })}
                />
                <select
                  className="border border-gray-300 rounded p-2"
                  value={newSuggestion.trainer}
                  onChange={(e) => setNewSuggestion({ ...newSuggestion, trainer: e.target.value })}
                >
                  <option value="">Select Trainer</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.displayName}>
                      {trainer.displayName}
                    </option>
                  ))}
                </select>
                <Button onClick={handleAddSuggestion}>Add Suggestion</Button>
              </div>
            </CardContent>
          </Card>

          {/* Trainer Preferences */}
          <Card className="rounded-[10px] mt-5 border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
            <CardHeader>
              <CardTitle>Trainer Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>First Choice:</strong> {customer.trainerPreferences.first}</p>
              <p><strong>Second Choice:</strong> {customer.trainerPreferences.second}</p>
              <p><strong>Third Choice:</strong> {customer.trainerPreferences.third}</p>
            </CardContent>
          </Card>

          {/* Slot Preferences */}
          <Card className="rounded-[10px] mt-5 border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
            <CardHeader>
              <CardTitle>Slot Preference</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Preferred Slot:</strong> {customer.preferredSlot}</p>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card className="rounded-[10px] mt-5 border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
            <CardHeader>
              <CardTitle>Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div key={index} className="mb-4">
                    <p><strong>Message:</strong> {suggestion.message}</p>
                    <p><strong>Slot:</strong> {suggestion.slot}</p>
                    <p><strong>Trainer:</strong> {suggestion.trainer}</p>
                  </div>
                ))
              ) : (
                <p>No suggestions available.</p>
              )}
            </CardContent>
          </Card>

          {/* Accepted Suggestion */}
          <Card className="rounded-[10px] mt-5 border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
            <CardHeader>
              <CardTitle>Accepted Suggestion</CardTitle>
            </CardHeader>
            <CardContent>
              {acceptedSuggestion ? (
                <div>
                  <p><strong>Message:</strong> {acceptedSuggestion.message}</p>
                  <p><strong>Slot:</strong> {acceptedSuggestion.slot}</p>
                  <p><strong>Trainer:</strong> {acceptedSuggestion.trainer}</p>
                  <p><strong>Suggestion ID:</strong> {acceptedSuggestion.suggestionId}</p>
                </div>
              ) : (
                <p>No accepted suggestion found.</p>
              )}
            </CardContent>
          </Card>

          {/* More Suggestions Request */}
          <Card className="rounded-[10px] mt-5 border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
            <CardHeader>
              <CardTitle>More Suggestions Request</CardTitle>
            </CardHeader>
            <CardContent>
              {moreSuggestionsRequest ? (
                <p><strong>Status:</strong> {moreSuggestionsRequest}</p>
              ) : (
                <p>No more suggestions requests found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      
      </div>
    </DefaultLayout>
  );
}
