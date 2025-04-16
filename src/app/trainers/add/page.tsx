'use client';

import React, { ChangeEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addData } from '@/config/firebaseConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Link from 'next/link';

import { auth } from '@/config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

interface TrainerFormData {
  displayName: string;
  email: string;
  specialization: string;
  type: string;  // Added trainer type field
  age: string;
  mobile: string;
  role: string;
}

const specializationOptions = [
  { value: '', label: 'Select specialization' },
  { value: 'Fitness Trainer', label: 'Fitness Trainer' },
  { value: 'Nutrition Trainer', label: 'Nutrition Trainer' },
  { value: 'Yoga Trainer', label: 'Yoga Trainer' },
  { value: 'Strength & Conditioning', label: 'Strength & Conditioning' },
  { value: 'Cardio Specialist', label: 'Cardio Specialist' },
];

const trainerTypeOptions = [
  { value: '', label: 'Select trainer type' },
  { value: 'Onsite', label: 'Onsite' },
  { value: 'Mobile', label: 'Mobile' },
];

export default function AddTrainer() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<TrainerFormData>({
    displayName: '',
    email: '',
    specialization: '',
    type: '',  // Initialize the new type field
    age: '',
    mobile: '',
    role: 'trainer'
  });

  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.specialization) {
      setError('Please select a specialization');
      return;
    }

    if (!formData.type) {
      setError('Please select a trainer type');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        password
      );

      // 2. Add the UID to the trainer data
      const trainerData = {
        ...formData,
        uid: userCredential.user.uid,
        createdAt: new Date().toISOString(),
      };

      // 3. Save trainer data to database
     // await addData('trainers', trainerData);

      // 4. Also save to users collection for auth purposes
      await addData(`users/${userCredential.user.uid}`, {
        ...formData,
        
        uid: userCredential.user.uid,
        createdAt: new Date().toISOString(),
      });

      router.push('/trainers');
      router.refresh();
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err?.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError('Failed to create trainer account');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[1080px]">
        <Link href="/trainers">
        <Breadcrumb pageName="Trainers" />
        </Link>
    <div >
      <Card className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <CardHeader>
          <CardTitle>Add New Trainer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Select
              label="Specialization"
              name="specialization"
              options={specializationOptions}
              value={formData.specialization}
              onChange={handleChange}
              required
              error={error && !formData.specialization ? 'Please select a specialization' : ''}
            />

            {/* New Trainer Type Select Field */}
            <Select
              label="Trainer Type"
              name="type"
              options={trainerTypeOptions}
              value={formData.type}
              onChange={handleChange}
              required
              error={error && !formData.type ? 'Please select a trainer type' : ''}
            />

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Trainer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/trainers')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </div>
    </DefaultLayout>
  );
}