'use client';

import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Customer {
  id: string;
  displayName: string;
  email: string;
}

interface Subscription {
  id: string;
  name: string;
  description: string;
  type: string;
  validForOnsite: boolean;
  validForMobile: boolean;
  active: boolean;
  createdAt: string;
  customers: Customer[];
}

interface Package {
  customerId: string;
  subscriptionId: string;
}

interface FirebaseUser {
  displayName: string;
  email: string;
  role: string;
}

export default function SubscriptionsList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSubscriptionsWithCustomers = async () => {
      try {
        // Fetch all data in parallel
        const [subscriptionsSnapshot, packagesSnapshot, usersSnapshot] = await Promise.all([
          get(ref(database, 'subscriptions')),
          get(ref(database, 'packages')),
          get(ref(database, 'users'))
        ]);

        const subscriptionsData = subscriptionsSnapshot.val() || {};
        const packagesData = packagesSnapshot.val() || {};
        const usersData = usersSnapshot.val() || {};

        // Create a map of subscriptionId to customers
        const subscriptionCustomersMap = new Map<string, Customer[]>();

        // Process packages to map subscriptions to customers
        Object.entries(packagesData).forEach(([packageId, packageInfo]: [string, any]) => {
          const { customerId, subscriptionId } = packageInfo as Package;
          
          if (customerId && subscriptionId && usersData[customerId]) {
            const user = usersData[customerId] as FirebaseUser;
            
            // Only include non-trainer users
            if (user.role !== 'trainer') {
              const customer: Customer = {
                id: customerId,
                displayName: user.displayName || 'N/A',
                email: user.email || 'N/A'
              };

              if (!subscriptionCustomersMap.has(subscriptionId)) {
                subscriptionCustomersMap.set(subscriptionId, []);
              }
              subscriptionCustomersMap.get(subscriptionId)!.push(customer);
            }
          }
        });

        // Combine subscriptions with their customers
        const subscriptionsList = Object.entries(subscriptionsData).map(([id, data]: [string, any]) => ({
          id,
          ...data,
          customers: subscriptionCustomersMap.get(id) || []
        }));

        setSubscriptions(subscriptionsList as Subscription[]);
      } catch (error) {
        console.error('Error fetching subscriptions with customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionsWithCustomers();
  }, []);

  const handleSortChange = (newSortBy: 'name' | 'type' | 'date') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const toggleRowExpansion = (subscriptionId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(subscriptionId)) {
      newExpandedRows.delete(subscriptionId);
    } else {
      newExpandedRows.add(subscriptionId);
    }
    setExpandedRows(newExpandedRows);
  };

  const filteredAndSortedSubscriptions = subscriptions
    .filter(subscription => 
      subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      subscription.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.customers.some(customer => 
        customer.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
      <div className="bg-white mx-auto w-full max-w-[1400px] space-y-6 p-4">
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
                  placeholder="Search subscriptions or customers..."
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
                      <th className="p-3 text-left">Expand</th>
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
                      <th className="p-3 text-center">Customers</th>
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
                      <React.Fragment key={subscription.id}>
                        <tr className="border-t hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="p-3">
                            {subscription.customers.length > 0 && (
                              <button
                                onClick={() => toggleRowExpansion(subscription.id)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {expandedRows.has(subscription.id) ? '−' : '+'}
                              </button>
                            )}
                          </td>
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
                          <td className="p-3 text-center">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              {subscription.customers.length}
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
                        
                        {/* Expanded customer details row */}
                        {expandedRows.has(subscription.id) && subscription.customers.length > 0 && (
                          <tr className="bg-gray-50 dark:bg-gray-900">
                            <td colSpan={10} className="p-4">
                              <div className="ml-8">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                  Customers ({subscription.customers.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {subscription.customers.map((customer) => (
                                    <div 
                                      key={customer.id}
                                      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                                    >
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {customer.displayName}
                                      </div>
                                      <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {customer.email}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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