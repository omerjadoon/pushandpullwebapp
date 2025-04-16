'use client';

import React, { useEffect, useState } from 'react';
import { ref, push, get } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface Subscription {
  id?: string;
  name: string;
  description: string;
  type: string;
  validForOnsite: boolean;
  validForMobile: boolean;
  active: boolean;
  createdAt: string;
}

export default function ManageSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Subscription form states
  const [subscriptionName, setSubscriptionName] = useState('');
  const [subscriptionDescription, setSubscriptionDescription] = useState('');
  const [subscriptionType, setSubscriptionType] = useState('');
  const [validForOnsite, setValidForOnsite] = useState(true);
  const [validForMobile, setValidForMobile] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        // Fetch subscriptions
        const subscriptionsRef = ref(database, 'subscriptions');
        const subscriptionsSnapshot = await get(subscriptionsRef);
        const subscriptionsData = subscriptionsSnapshot.val();

        // Process subscriptions
        if (subscriptionsData) {
          const subscriptionsList = Object.entries(subscriptionsData).map(([id, data]: [string, any]) => ({
            id,
            ...data,
          }));
          setSubscriptions(subscriptionsList as Subscription[]);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleSubmitSubscription = async () => {
    if (!subscriptionName || !subscriptionDescription || !subscriptionType) {
      alert('Please fill in all required subscription fields.');
      return;
    }

    try {
      const subscriptionRef = ref(database, 'subscriptions');
      const newSubscription: Subscription = {
        name: subscriptionName,
        description: subscriptionDescription,
        type: subscriptionType,
        validForOnsite,
        validForMobile,
        active: isActive,
        createdAt: new Date().toISOString()
      };

      await push(subscriptionRef, newSubscription);
      alert('Subscription added successfully!');

      // Refresh subscriptions
      const updatedSubscriptionsRef = ref(database, 'subscriptions');
      const subscriptionsSnapshot = await get(updatedSubscriptionsRef);
      const subscriptionsData = subscriptionsSnapshot.val();
      
      if (subscriptionsData) {
        const subscriptionsList = Object.entries(subscriptionsData).map(([id, data]: [string, any]) => ({
          id,
          ...data,
        }));
        setSubscriptions(subscriptionsList as Subscription[]);
      }

      // Reset form
      setSubscriptionName('');
      setSubscriptionDescription('');
      setSubscriptionType('');
      setValidForOnsite(true);
      setValidForMobile(true);
      setIsActive(true);
    } catch (error) {
      console.error('Error adding subscription:', error);
      alert('Failed to add subscription. Please try again.');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[1080px] space-y-6">
        

        {/* Add New Subscription Card */}
        <Card className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-dark">
          <CardHeader>
            <CardTitle>Add New Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              {/* Subscription Name */}
              <div>
                <label className="block mb-2 font-medium">Subscription Name</label>
                <Input
                  placeholder="Enter subscription name"
                  value={subscriptionName}
                  onChange={(e) => setSubscriptionName(e.target.value)}
                />
              </div>

              {/* Subscription Description */}
              <div>
                <label className="block mb-2 font-medium">Description</label>
                <textarea
                  className="border border-gray-300 rounded p-2 w-full"
                  placeholder="Enter subscription description"
                  value={subscriptionDescription}
                  onChange={(e) => setSubscriptionDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Subscription Type */}
              <div>
                <label className="block mb-2 font-medium">Subscription Type</label>
                <select
                  className="border border-gray-300 rounded p-2 w-full"
                  value={subscriptionType}
                  onChange={(e) => setSubscriptionType(e.target.value)}
                >
                  <option value="">-- Select Type --</option>
                  <option value="inhouse">Inhouse</option>
                  <option value="mobile">Mobile</option>
                  <option value="virtual">Virtual</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Valid for Onsite */}
              <div className="flex items-center justify-between">
                <label className="font-medium">Valid for Onsite</label>
                <Switch 
                  checked={validForOnsite} 
                  onCheckedChange={setValidForOnsite} 
                />
              </div>

              {/* Valid for Mobile */}
              <div className="flex items-center justify-between">
                <label className="font-medium">Valid for Mobile</label>
                <Switch 
                  checked={validForMobile}
                  onCheckedChange={setValidForMobile}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <label className="font-medium">Active</label>
                <Switch 
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              {/* Submit Subscription */}
              <Button onClick={handleSubmitSubscription} className="w-full">
                Create Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing Subscriptions Card */}
        {subscriptions.length > 0 && (
          <Card className="rounded-lg border bg-white shadow-sm mb-6 dark:bg-gray-dark">
            <CardHeader>
              <CardTitle>Existing Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">{subscription.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${subscription.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {subscription.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{subscription.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p><span className="font-medium">Type:</span> {subscription.type}</p>
                      <p><span className="font-medium">Created:</span> {new Date(subscription.createdAt).toLocaleDateString()}</p>
                      <p><span className="font-medium">Valid for Onsite:</span> {subscription.validForOnsite ? 'Yes' : 'No'}</p>
                      <p><span className="font-medium">Valid for Mobile:</span> {subscription.validForMobile ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DefaultLayout>
  );
}