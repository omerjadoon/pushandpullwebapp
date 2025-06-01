'use client';

import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Subscription {
  id: string;
  name: string;
  description: string;
  type: string;
  validForOnsite: boolean;
  validForMobile: boolean;
  active: boolean;
  createdAt: string;
}

export default function SubscriptionsList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subscriptionsRef = ref(database, 'subscriptions');
        const subscriptionsSnapshot = await get(subscriptionsRef);
        const subscriptionsData = subscriptionsSnapshot.val();

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

  const handleSortChange = (newSortBy: 'name' | 'type' | 'date') => {
    if (sortBy === newSortBy) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default to ascending
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedSubscriptions = subscriptions
    .filter(subscription => 
      subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      subscription.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(subscription => 
      filterActive === null ? true : subscription.active === filterActive
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'type') {
        return sortOrder === 'asc'
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      } else { // date
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2">Loading subscriptions...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="bg-white mx-auto w-full max-w-[1200px] space-y-6 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <Link href="/subscription/add">
            <Button>Add New Subscription</Button>
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-grow">
                <Input
                  placeholder="Search subscriptions...."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  className="border rounded p-2"
                  value={filterActive === null ? 'all' : filterActive ? 'active' : 'inactive'}
                  onChange={(e) => {
                    if (e.target.value === 'all') setFilterActive(null);
                    else if (e.target.value === 'active') setFilterActive(true);
                    else setFilterActive(false);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {filteredAndSortedSubscriptions.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <p>No subscriptions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th 
                        className="p-3 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => handleSortChange('name')}
                      >
                        <div className="flex items-center">
                          Name
                          {sortBy === 'name' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="p-3 text-left">Description</th>
                      <th 
                        className="p-3 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => handleSortChange('type')}
                      >
                        <div className="flex items-center">
                          Type
                          {sortBy === 'type' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="p-3 text-center">Onsite</th>
                      <th className="p-3 text-center">Mobile</th>
                      <th className="p-3 text-center">Status</th>
                      <th 
                        className="p-3 text-left cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => handleSortChange('date')}
                      >
                        <div className="flex items-center">
                          Created
                          {sortBy === 'date' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedSubscriptions.map((subscription) => (
                      <tr 
                        key={subscription.id} 
                        className="border-t hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <td className="p-3 font-medium">{subscription.name}</td>
                        <td className="p-3 max-w-xs truncate">{subscription.description}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {subscription.type}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {subscription.validForOnsite ? 
                            <span className="text-green-600">✓</span> : 
                            <span className="text-red-600">✗</span>}
                        </td>
                        <td className="p-3 text-center">
                          {subscription.validForMobile ? 
                            <span className="text-green-600">✓</span> : 
                            <span className="text-red-600">✗</span>}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            subscription.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {subscription.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3">
                          {new Date(subscription.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            {/* <Link href={`/subscriptions/edit/${subscription.id}`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            <Link href={`/subscriptions/view/${subscription.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
}