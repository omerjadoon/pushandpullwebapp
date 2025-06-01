'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ref, get } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Smartphone, Monitor, Tag, FileText } from 'lucide-react';

interface Subscription {
  id: string;
  name: string;
  description: string;
  type: string;
  validForOnsite: boolean;
  validForMobile: boolean;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  price?: number;
  duration?: string;
  features?: string[];
}

export default function SubscriptionDetails() {
  const params = useParams();
  const router = useRouter();
  const subscriptionId = params.id as string;
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!subscriptionId) {
        setError('Subscription ID is required');
        setLoading(false);
        return;
      }

      try {
        const subscriptionRef = ref(database, `subscriptions/${subscriptionId}`);
        const subscriptionSnapshot = await get(subscriptionRef);
        
        if (subscriptionSnapshot.exists()) {
          const subscriptionData = subscriptionSnapshot.val();
          setSubscription({
            id: subscriptionId,
            ...subscriptionData,
          });
        } else {
          setError('Subscription not found');
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setError('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [subscriptionId]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2">Loading subscription details...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error || !subscription) {
    return (
      <DefaultLayout>
        <div className="bg-white mx-auto w-full max-w-[1200px] space-y-6 p-4">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          
          <Card className="shadow-sm">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {error || 'Subscription not found'}
                </h2>
                <p className="text-gray-600 mb-4">
                  The subscription you're looking for doesn't exist or couldn't be loaded.
                </p>
                <Link href="/subscriptions">
                  <Button>Return to Subscriptions</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="bg-white mx-auto w-full max-w-[1200px] space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{subscription.name}</h1>
              <p className="text-gray-600">Subscription Details</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link href={`/subscription/edit/${subscription.id}`}>
              <Button variant="outline">Edit Subscription</Button>
            </Link>
            <Badge 
              variant={subscription.active ? "default" : "secondary"}
              className={`px-3 py-1 ${
                subscription.active 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              {subscription.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-lg font-semibold">{subscription.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900">{subscription.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Tag className="h-3 w-3 mr-1" />
                        {subscription.type}
                      </Badge>
                    </div>
                  </div>
                  
                  {subscription.price && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Price</label>
                      <p className="text-lg font-semibold text-green-600">
                        ${subscription.price}
                        {subscription.duration && <span className="text-sm text-gray-500">/{subscription.duration}</span>}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            {subscription.features && subscription.features.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {subscription.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Availability */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Platform Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-gray-600" />
                    <span>Onsite Access</span>
                  </div>
                  {subscription.validForOnsite ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-gray-600" />
                    <span>Mobile Access</span>
                  </div>
                  {subscription.validForMobile ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(subscription.createdAt).toLocaleString()}
                  </p>
                </div>
                
                {subscription.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="text-sm text-gray-900">
                      {new Date(subscription.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/subscription/edit/${subscription.id}`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    Edit Subscription
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    // Add duplicate functionality here
                    console.log('Duplicate subscription:', subscription.id);
                  }}
                >
                  Duplicate Subscription
                </Button>
                
                <Link href="/subscriptions" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    Back to All Subscriptions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}