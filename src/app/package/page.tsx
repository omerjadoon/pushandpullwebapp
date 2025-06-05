'use client';

import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordian";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Users, Weight, Ruler, Target, ClipboardList, Clock, CreditCard } from 'lucide-react';

interface Package {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  customerGoal: string;
  height: number;
  weight: number;
  trainerId: string;
  plans: Plan[];
  isFreeTrial?: boolean;
  subscriptionId?: string;
}

interface Plan {
  title: string;
  type: string;
  description: string;
  date: string;
}

interface Trainer {
  uid: string;
  displayName: string;
  specialization: string;
  email: string;
  mobile: string;
}

interface Customer {
  id: string;
  displayName: string;
  freetrial?: string;
  freetrialDate?: string;
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
}

export default function PackageList() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [trainers, setTrainers] = useState<Record<string, Trainer>>({});
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [subscriptions, setSubscriptions] = useState<Record<string, Subscription>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users (trainers and customers)
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        const usersData = usersSnapshot.val();
        
        const trainersMap: Record<string, Trainer> = {};
        const customersMap: Record<string, Customer> = {};
        
        Object.entries(usersData || {}).forEach(([id, data]: [string, any]) => {
          if (data.role === 'trainer') {
            trainersMap[id] = {
              uid: id,
              displayName: data.displayName,
              specialization: data.specialization,
              email: data.email,
              mobile: data.mobile,
            };
          } else {
            customersMap[id] = {
              id,
              displayName: data.displayName,
              freetrial: data.freetrial,
              freetrialDate: data.freetrialDate,
            };
          }
        });
        
        setTrainers(trainersMap);
        setCustomers(customersMap);

        // Fetch subscriptions
        const subscriptionsRef = ref(database, 'subscriptions');
        const subscriptionsSnapshot = await get(subscriptionsRef);
        const subscriptionsData = subscriptionsSnapshot.val();
        
        const subscriptionsMap: Record<string, Subscription> = {};
        if (subscriptionsData) {
          Object.entries(subscriptionsData).forEach(([id, data]: [string, any]) => {
            subscriptionsMap[id] = {
              id,
              ...data
            };
          });
        }
        setSubscriptions(subscriptionsMap);

        // Fetch packages
        const packagesRef = ref(database, 'packages');
        const packagesSnapshot = await get(packagesRef);
        const packagesData = packagesSnapshot.val();

        if (packagesData) {
          const packagesList = Object.entries(packagesData).map(([id, data]: [string, any]) => ({
            id,
            ...data,
          }));
          setPackages(packagesList);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTrainerInfo = (trainerId: string) => {
    return trainers[trainerId] || { displayName: 'Unknown Trainer', specialization: 'Not specified' };
  };

  const getCustomerInfo = (customerId: string) => {
    return customers[customerId] || { displayName: 'Unknown Customer' };
  };

  const getSubscriptionInfo = (subscriptionId: string) => {
    return subscriptions[subscriptionId] || null;
  };

  // Calculate remaining free trial days
  const getRemainingFreeTrialDays = (freetrialDate: string) => {
    if (!freetrialDate) return 0;
    
    const startDate = new Date(freetrialDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7); // 1 week later
    
    const currentDate = new Date();
    const remainingTime = endDate.getTime() - currentDate.getTime();
    const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    
    return remainingDays > 0 ? remainingDays : 0;
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg">Loading packages...</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[1080px] space-y-6 p-4">
        <Card className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl">Package List</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-4">
              {packages.map((pkg) => {
                const customerData = getCustomerInfo(pkg.customerId);
                const isFreeTrial = pkg.isFreeTrial || customerData.freetrial === "yes";
                const remainingDays = isFreeTrial ? getRemainingFreeTrialDays(customerData.freetrialDate || '') : 0;
                const subscription = pkg.subscriptionId ? getSubscriptionInfo(pkg.subscriptionId) : null;
                
                return (
                  <AccordionItem 
                    key={pkg.id} 
                    value={pkg.id}
                    className="border rounded-lg px-4 py-2 mb-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex justify-between w-full items-center">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold">{pkg.title}</h3>
                          <Badge variant="outline" className="ml-2">
                            {pkg.plans?.length || 0} Plans
                          </Badge>
                          {isFreeTrial && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                              Free Trial {remainingDays > 0 ? `(${remainingDays} days left)` : '(Expired)'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <Card className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Customer Information
                          </h4>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-medium">Name:</span> {pkg.customerName}
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              <span className="font-medium">Goal:</span> {pkg.customerGoal}
                            </p>
                            <div className="flex gap-4">
                              <p className="text-sm flex items-center gap-2">
                                <Ruler className="h-4 w-4" />
                                <span className="font-medium">Height:</span> {pkg.height} cm
                              </p>
                              <p className="text-sm flex items-center gap-2">
                                <Weight className="h-4 w-4" />
                                <span className="font-medium">Weight:</span> {pkg.weight} kg
                              </p>
                            </div>
                            {isFreeTrial && (
                              <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
                                <p className="text-sm flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">Free Trial:</span> 
                                  {remainingDays > 0 ? `${remainingDays} days remaining` : 'Expired'}
                                </p>
                                {customerData.freetrialDate && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Started on: {new Date(customerData.freetrialDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>

                        {/* Trainer Information */}
                        <Card className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Trainer Information
                          </h4>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-medium">Name:</span> {getTrainerInfo(pkg.trainerId).displayName}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Specialization:</span> {getTrainerInfo(pkg.trainerId).specialization}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Contact:</span> {getTrainerInfo(pkg.trainerId).mobile}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Email:</span> {getTrainerInfo(pkg.trainerId).email}
                            </p>
                          </div>
                        </Card>

                        {/* Subscription Information */}
                        <Card className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Subscription Information
                          </h4>
                          {subscription ? (
                            <div className="space-y-2">
                              <p className="text-sm">
                                <span className="font-medium">Plan:</span> {subscription.name}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Type:</span> 
                                <Badge variant="outline" className="ml-2">{subscription.type}</Badge>
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Status:</span> 
                                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                  subscription.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {subscription.active ? 'Active' : 'Inactive'}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Valid for:</span> 
                                {subscription.validForOnsite && <span className="ml-2 text-xs">Onsite</span>}
                                {subscription.validForMobile && <span className="ml-2 text-xs">Mobile</span>}
                              </p>
                              <p className="text-sm text-gray-600">{subscription.description}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No subscription information available</p>
                          )}
                        </Card>

                        {/* Training Plans */}
                        {pkg.plans && pkg.plans.length > 0 && (
                          <Card className="border rounded-lg p-4 md:col-span-2">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <ClipboardList className="h-5 w-5" />
                              Training Plans
                            </h4>
                            <div className="space-y-4">
                              {pkg.plans.map((plan, index) => (
                                <div key={index} className="border rounded p-3 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <h5 className="font-medium">{plan.title}</h5>
                                    <Badge variant="secondary">{plan.type}</Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">{plan.description}</p>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    {plan.date}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {packages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No packages found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
}