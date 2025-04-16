'use client';

import React, { useEffect, useState } from 'react';
import { ref, push, get, update } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface Customer {
  id: string;
  displayName: string;
  goal: string;
  height: number;
  weight: number;
  freetrial?: string;
  freetrialDate?: string;
}

interface Trainer {
  uid: string;
  displayName: string;
  specialization: string;
  email: string;
}

interface PackagePlan {
  title: string;
  type: string;
  description: string;
  date: string;
}

interface Package {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  customerGoal: string;
  height: number;
  weight: number;
  trainerId: string;
  plans: PackagePlan[];
  isFreeTrial?: boolean;
}

const sendNotification = async (userId: string, trainerId: string, type: string, title: string, content: string) => {
  const notificationRef = ref(database, `customerNotifications/${userId}`);
  const newNotification = {
    id: Date.now().toString(), // Unique ID for the notification
    message: content,
    read: false, // Default to unread
    timestamp: new Date().toISOString(), // Current timestamp
    trainerId: trainerId, // ID of the trainer sending the notification
    type: type, // Type of notification (e.g., "package_created")
    details: {
      title: title, // Title of the notification
      content: content, // Content of the notification
    },
  };
  await push(notificationRef, newNotification);
};


const sendTrainerNotification = async (
  trainerId: string,
  customerId: string,
  type: string,
  message: string,
  details: {
    caloriesBurned: number;
    carbohydrates: number;
    heartRate: number;
    workoutMinutes: number;
  },
  packageId: string,
  planId: string,
  progressId: string
) => {
  const notificationRef = ref(database, `trainerNotifications/${trainerId}`);
  const newNotification = {
    customerId: customerId,
    details: details,
    id: Date.now().toString(), // Unique ID for the notification
    message: message,
    packageId: packageId,
    planId: planId,
    progressId: progressId,
    read: false, // Default to unread
    timestamp: new Date().toISOString(), // Current timestamp
    type: type, // Type of notification (e.g., "progress_update")
  };

  await push(notificationRef, newNotification);
};

export default function AddPackage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [packageTitle, setPackageTitle] = useState<string>('');
  const [trainerId, setTrainerId] = useState<string>('');
  const [customerGoal, setCustomerGoal] = useState<string>('');
  const [height, setHeight] = useState<number | string>('');
  const [weight, setWeight] = useState<number | string>('');
  const [plans, setPlans] = useState<PackagePlan[]>([]);
  const [existingPackages, setExistingPackages] = useState<Package[]>([]);
  const [isFreeTrial, setIsFreeTrial] = useState<boolean>(false);
  const [newPlan, setNewPlan] = useState<PackagePlan>({
    title: '',
    type: '',
    description: '',
    date: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersRef = ref(database, `users`);
        const usersSnapshot = await get(usersRef);
        const usersData = usersSnapshot.val();

        // Separate customers and trainers
        const customerList: Customer[] = [];
        const trainerList: Trainer[] = [];

        Object.entries(usersData || {}).forEach(([id, user]: [string, any]) => {
          if (user.role === 'trainer') {
            trainerList.push({
              uid: id,
              displayName: user.displayName,
              specialization: user.specialization,
              email: user.email,
            });
          } else {
            customerList.push({
              id,
              displayName: user.displayName,
              goal: user.goal,
              height: parseFloat(user.height),
              weight: parseFloat(user.weight),
              freetrial: user.freetrial,
              freetrialDate: user.freetrialDate,
            });
          }
        });

        setCustomers(customerList);
        setTrainers(trainerList);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchExistingPackages = async () => {
      if (!selectedCustomer) {
        setExistingPackages([]);
        return;
      }

      try {
        const packagesRef = ref(database, 'packages');
        const packagesSnapshot = await get(packagesRef);
        const packagesData = packagesSnapshot.val();

        if (packagesData) {
          const customerPackages = Object.entries(packagesData)
            .filter(([, pkg]: [string, any]) => pkg.customerId === selectedCustomer)
            .map(([id, pkg]: [string, any]) => ({
              id,
              ...pkg,
            }));

          setExistingPackages(customerPackages as Package[]);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };

    fetchExistingPackages();
  }, [selectedCustomer]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedCustomer(selectedId);

    if (selectedId) {
      const selectedCustomerData = customers.find(customer => customer.id === selectedId);
      if (selectedCustomerData) {
        setCustomerGoal(selectedCustomerData.goal);
        setHeight(selectedCustomerData.height);
        setWeight(selectedCustomerData.weight);
      }
    }
  };

  const handleAddPlan = () => {
    if (!newPlan.title || !newPlan.type || !newPlan.description || !newPlan.date) {
      alert('Please fill out all plan fields before adding.');
      return;
    }

    setPlans([...plans, newPlan]);
    setNewPlan({ title: '', type: '', description: '', date: '' });
  };
  
  const sendFirstMessage = async (trainerId: string, customerId: string, firstMessage: string) => {
    const chatRef = ref(database, `chats/${trainerId}_${customerId}/messages`); // Directly use trainerId_customerId as the parent node
    
    const newMessage = {
      senderId: trainerId, // Trainer sends the first message
      text: firstMessage, // Initial message content
      timestamp: Date.now(), // Current timestamp
    };
  
    await push(chatRef, newMessage); // Add the first message
  };

  const handleSubmitPackage = async () => {
    if (!selectedCustomer || !packageTitle || !trainerId || !customerGoal || !height || !weight) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const packageRef = ref(database, `packages`);
      const newPackage = {
        customerId: selectedCustomer,
        customerName: customers.find((customer) => customer.id === selectedCustomer)?.displayName || '',
        title: packageTitle,
        customerGoal,
        height: parseInt(height as string, 10),
        weight: parseInt(weight as string, 10),
        trainerId: trainerId,
        plans,
        isFreeTrial, // Add the free trial status to the package
      };

      const packageSnapshot = await push(packageRef, newPackage);
      const packageId = packageSnapshot.key;
      
      // If marked as free trial, update the customer's freetrial field
      if (isFreeTrial) {
        const currentDate = new Date().toISOString();
        const customerRef = ref(database, `users/${selectedCustomer}`);
        await update(customerRef, {
          freetrial: "yes",
          freetrialDate: currentDate
        });
        
        // Update local state to reflect the changes
        setCustomers(prevCustomers => 
          prevCustomers.map(customer => 
            customer.id === selectedCustomer 
              ? { ...customer, freetrial: "yes", freetrialDate: currentDate } 
              : customer
          )
        );
      }

      alert('Package added successfully!');

      // Send Notification to Customer
      const customerNotificationTitle = isFreeTrial ? "New Free Trial Package Created" : "New Package Created";
      const customerNotificationContent = isFreeTrial 
        ? `Free Trial Package "${packageTitle}" has been created for you. Valid for 1 week from today.`
        : `Package "${packageTitle}" has been created for you.`;
        
      await sendNotification(
        selectedCustomer,
        trainerId,
        "package_created", // Notification type
        customerNotificationTitle,
        customerNotificationContent
      );

      // Send the first message from the trainer
      const welcomeMessage = isFreeTrial 
        ? "Hello! Welcome to your free 1-week trial at Push and Pull Fitness App."
        : "Hello! Welcome to Push and Pull Fitness App.";
        
      await sendFirstMessage(trainerId, selectedCustomer, welcomeMessage);
      
      // Refresh existing packages
      const updatedPackagesRef = ref(database, 'packages');
      const packagesSnapshot = await get(updatedPackagesRef);
      const packagesData = packagesSnapshot.val();
      
      if (packagesData) {
        const customerPackages = Object.entries(packagesData)
          .filter(([, pkg]: [string, any]) => pkg.customerId === selectedCustomer)
          .map(([id, pkg]: [string, any]) => ({
            id,
            ...pkg,
          }));

        setExistingPackages(customerPackages as Package[]);
      }

      // Reset form
      setPackageTitle('');
      setTrainerId('');
      setPlans([]);
      setIsFreeTrial(false);
    } catch (error) {
      console.error('Error adding package:', error);
      alert('Failed to add package. Please try again.');
    }
  };

  const getTrainerName = (trainerId: string) => {
    const trainer = trainers.find(t => t.uid === trainerId);
    return trainer ? `${trainer.displayName} (${trainer.specialization})` : 'Unknown Trainer';
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[1080px] space-y-6">
        

        {/* Add New Package Card */}
        <Card className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
          <CardHeader>
            <CardTitle>Add New Package</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              {/* Customer Dropdown */}
              <div>
                <label className="block mb-2 font-medium">Select Customer</label>
                <select
                  className="border border-gray-300 rounded p-2 w-full"
                  value={selectedCustomer}
                  onChange={handleCustomerChange}
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.displayName} 
                      {customer.freetrial === "yes" && " (Free Trial Active)"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Package Title */}
              <Input
                placeholder="Package Title"
                value={packageTitle}
                onChange={(e) => setPackageTitle(e.target.value)}
              />

              {/* Customer Goal */}
              <Input
                placeholder="Customer Goal"
                value={customerGoal}
                onChange={(e) => setCustomerGoal(e.target.value)}
                disabled
              />

              {/* Height */}
              <Input
                type="number"
                placeholder="Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                disabled
              />

              {/* Weight */}
              <Input
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                disabled
              />

              {/* Trainer Selection */}
              <div>
                <label className="block mb-2 font-medium">Select Trainer</label>
                <select
                  className="border border-gray-300 rounded p-2 w-full"
                  value={trainerId}
                  onChange={(e) => setTrainerId(e.target.value)}
                >
                  <option value="">-- Select Trainer --</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.uid} value={trainer.uid}>
                      {trainer.displayName} ({trainer.specialization})
                    </option>
                  ))}
                </select>
              </div>

              {/* Free Trial Checkbox */}
                <div className="flex items-center space-x-2">
                

                <Checkbox 
                  id="freetrial" 
                  checked={isFreeTrial}
                  onCheckedChange={(checked: boolean | "indeterminate") => setIsFreeTrial(checked as boolean)} 
                />
                <label 
                  htmlFor="freetrial"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mark as Free Trial (Valid for 1 week)
                </label>
                </div>
              
              {/* Display warning if customer already has an active free trial */}
              {isFreeTrial && selectedCustomer && customers.find(c => c.id === selectedCustomer)?.freetrial === "yes" && (
                <div className="text-yellow-600 text-sm">
                  This customer already has an active free trial. Adding another free trial will update their trial period.
                </div>
              )}

              {/* Submit Package */}
              <Button onClick={handleSubmitPackage} className="w-full">
                Submit Package
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing Packages Card */}
        {selectedCustomer && existingPackages.length > 0 && (
          <Card className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <CardHeader>
              <CardTitle>Existing Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {existingPackages.map((pkg) => (
                  <div key={pkg.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {pkg.title} {pkg.isFreeTrial && <span className="text-green-500 text-sm font-normal">(Free Trial)</span>}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p><span className="font-medium">Trainer:</span> {getTrainerName(pkg.trainerId)}</p>
                      <p><span className="font-medium">Goal:</span> {pkg.customerGoal}</p>
                      <p><span className="font-medium">Height:</span> {pkg.height} cm</p>
                      <p><span className="font-medium">Weight:</span> {pkg.weight} kg</p>
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