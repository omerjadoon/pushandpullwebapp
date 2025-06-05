"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../app/firebaseFunctions/firebaseConfig";
import TrainerForm  from "../../components/Trainers/TrainerForm";

import { deleteTrainer } from "../../app/firebaseFunctions/trainerFunctions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Link from "next/link";

interface Trainer {
  id: string;
  displayName: string;
  email: string;
  mobile: string;
  goal: string;
  freetrial?: boolean;
  subscriptionId?: string;
  subscriptionName?: string;
  subscriptionType?: string;
}

interface FirebaseUser {
  role: string;
  displayName: string;
  email: string;
  specialization: string;
  mobile?: string;
  goal?: string;
  freetrial?: boolean;
}

interface Package {
  customerId: string;
  subscriptionId: string;
}

interface Subscription {
  name: string;
  type: string;
}

const Users = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubscription, setFilterSubscription] = useState<string>('all');
  const [filterFreeTrial, setFilterFreeTrial] = useState<string>('all');

  useEffect(() => {
    const fetchUsersWithSubscriptions = async () => {
      try {
        // Get users data
        const usersRef = ref(database, "users");
        const packagesRef = ref(database, "packages");
        const subscriptionsRef = ref(database, "subscriptions");

        // Create a map to store subscription data for quick lookup
        const subscriptionMap = new Map<string, Subscription>();
        const customerSubscriptionMap = new Map<string, string>(); // customerId -> subscriptionId

        // First, get all subscriptions
        onValue(subscriptionsRef, (snapshot) => {
          const subscriptionsData = snapshot.val() as Record<string, Subscription>;
          if (subscriptionsData) {
            Object.entries(subscriptionsData).forEach(([subscriptionId, subscription]) => {
              subscriptionMap.set(subscriptionId, subscription);
            });
          }
        });

        // Then, get packages data to map customers to subscriptions
        onValue(packagesRef, (snapshot) => {
          const packagesData = snapshot.val() as Record<string, Package>;
          if (packagesData) {
            Object.entries(packagesData).forEach(([packageId, packageInfo]) => {
              if (packageInfo.customerId && packageInfo.subscriptionId) {
                customerSubscriptionMap.set(packageInfo.customerId, packageInfo.subscriptionId);
              }
            });
          }
        });

        // Finally, get users and combine with subscription data
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val() as Record<string, FirebaseUser>;
          
          if (data) {
            const allFields = new Set<string>();
            Object.values(data).forEach((user: any) => {
              Object.keys(user).forEach((key) => {
                allFields.add(key);
              });
            });
            console.log("Available user fields (columns):", Array.from(allFields));
          }

          const trainerList = Object.entries(data || {})
            .filter(([id, user]) => user.role !== "trainer")
            .map(([id, user]) => {
              // Get subscription ID for this customer
              const subscriptionId = customerSubscriptionMap.get(id);
              let subscriptionName = "";
              let subscriptionType = "";

              if (subscriptionId) {
                const subscription = subscriptionMap.get(subscriptionId);
                if (subscription) {
                  subscriptionName = subscription.name || "";
                  subscriptionType = subscription.type || "";
                }
              }

              return {
                id,
                displayName: user.displayName,
                email: user.email,
                mobile: user.mobile || "",
                goal: user.goal || "",
                freetrial: user.freetrial || false,
                subscriptionId: subscriptionId || "",
                subscriptionName,
                subscriptionType,
              };
            });

          setTrainers(trainerList);
          setLoading(false);
        });

      } catch (error) {
        console.error("Error fetching users with subscriptions:", error);
        setLoading(false);
      }
    };

    fetchUsersWithSubscriptions();
  }, []);

  const handleDeleteTrainer = async (id: string) => {
    try {
      await deleteTrainer(id);
      console.log("Trainer deleted successfully!");
    } catch (error) {
      console.error("Error deleting trainer:", error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedTrainer(null);
  };

  if (showForm) {
    return (
      <TrainerForm
        trainer={selectedTrainer}
        onClose={handleFormClose}
      />
    );
  }

  if (loading) {
    return (
      <DefaultLayout>
        <div className="mx-auto w-full max-w-[1080px]">
          <Breadcrumb pageName="Customers" />
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading customers...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[1080px]">
        <Breadcrumb pageName="Customers" />
        <div className="flex flex-col gap-10">
         
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Customers List</h2>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <Input
            placeholder="Search customers by name, email, phone, or goal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="border rounded p-2 min-w-[150px]"
            value={filterSubscription}
            onChange={(e) => setFilterSubscription(e.target.value)}
          >
            <option value="all">All Subscriptions</option>
            <option value="has_subscription">Has Subscription</option>
            <option value="no_subscription">No Subscription</option>
          </select>
          <select 
            className="border rounded p-2 min-w-[120px]"
            value={filterFreeTrial}
            onChange={(e) => setFilterFreeTrial(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="free_trial">Free Trial</option>
            <option value="paid">Paid Users</option>
          </select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F7F9FC] text-left dark:bg-dark-2">
              <TableHead className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                Name
              </TableHead>
              <TableHead className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Email
              </TableHead>
              <TableHead className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                Phone Number
              </TableHead>
              <TableHead className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                Goal
              </TableHead>
              <TableHead className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                Free Trial
              </TableHead>
              <TableHead className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Subscription ID
              </TableHead>
              <TableHead className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Subscription Name
              </TableHead>
              <TableHead className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Subscription Type
              </TableHead>
              <TableHead className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainers
              .filter(trainer => {
                // Text search filter
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = searchTerm === '' || 
                  trainer.displayName.toLowerCase().includes(searchLower) ||
                  trainer.email.toLowerCase().includes(searchLower) ||
                  trainer.mobile.toLowerCase().includes(searchLower) ||
                  trainer.goal.toLowerCase().includes(searchLower) ||
                  (trainer.subscriptionName && trainer.subscriptionName.toLowerCase().includes(searchLower)) ||
                  (trainer.subscriptionType && trainer.subscriptionType.toLowerCase().includes(searchLower));

                // Subscription filter
                const matchesSubscription = filterSubscription === 'all' ||
                  (filterSubscription === 'has_subscription' && trainer.subscriptionId) ||
                  (filterSubscription === 'no_subscription' && !trainer.subscriptionId);

                // Free trial filter
                const matchesFreeTrial = filterFreeTrial === 'all' ||
                  (filterFreeTrial === 'free_trial' && trainer.freetrial) ||
                  (filterFreeTrial === 'paid' && !trainer.freetrial);

                return matchesSearch && matchesSubscription && matchesFreeTrial;
              })
              .map((trainer, index, filteredArray) => (
              <TableRow key={trainer.id}>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5 ${
                    index === filteredArray.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <h5 className="text-dark dark:text-white">
                    {trainer.displayName}
                  </h5>
                </TableCell>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                    index === filteredArray.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <p className="text-dark dark:text-white">
                    {trainer.email}
                  </p>
                </TableCell>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                    index === filteredArray.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <p className="text-dark dark:text-white">
                    {trainer.mobile}
                  </p>
                </TableCell>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                    index === filteredArray.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <p className="text-dark dark:text-white">
                    {trainer.goal}
                  </p>
                </TableCell>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                    index === filteredArray.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <p className="text-dark dark:text-white">
                    {trainer.freetrial ? "Yes" : "No"}
                  </p>
                </TableCell>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                    index === filteredArray.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <p className="text-dark dark:text-white">
                    {trainer.subscriptionId || "No Subscription"}
                  </p>
                </TableCell>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                    index === filteredArray.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <p className="text-dark dark:text-white">
                    {trainer.subscriptionName || "N/A"}
                  </p>
                </TableCell>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                    index === filteredArray.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <p className="text-dark dark:text-white">
                    {trainer.subscriptionType || "N/A"}
                  </p>
                </TableCell>

                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5 ${
                    index === filteredArray.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <div className="flex items-center justify-end space-x-3.5">
                  {/* <Link href={`/users/edit/${trainer.id}`}>
                    <button
                      className="hover:text-primary"
                    >
                      <FiEdit2 className="h-5 w-5" />
                    </button>
                  </Link> */}
                    <button
                      className="hover:text-primary"
                      onClick={() => handleDeleteTrainer(trainer.id)}
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {trainers.filter(trainer => {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = searchTerm === '' || 
            trainer.displayName.toLowerCase().includes(searchLower) ||
            trainer.email.toLowerCase().includes(searchLower) ||
            trainer.mobile.toLowerCase().includes(searchLower) ||
            trainer.goal.toLowerCase().includes(searchLower) ||
            (trainer.subscriptionName && trainer.subscriptionName.toLowerCase().includes(searchLower)) ||
            (trainer.subscriptionType && trainer.subscriptionType.toLowerCase().includes(searchLower));

          const matchesSubscription = filterSubscription === 'all' ||
            (filterSubscription === 'has_subscription' && trainer.subscriptionId) ||
            (filterSubscription === 'no_subscription' && !trainer.subscriptionId);

          const matchesFreeTrial = filterFreeTrial === 'all' ||
            (filterFreeTrial === 'free_trial' && trainer.freetrial) ||
            (filterFreeTrial === 'paid' && !trainer.freetrial);

          return matchesSearch && matchesSubscription && matchesFreeTrial;
        }).length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No customers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
        
        </div>
      
     
        
      </div>
    </DefaultLayout>
  );
};

export default Users;