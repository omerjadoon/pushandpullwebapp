'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addData, updateData, fetchData } from '@/config/firebaseConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Link from 'next/link';

import { Select } from '@/components/ui/select';

interface TrainerFormProps {
  params: {
    id?: string;
  };
}

const specializationOptions = [
  { value: '', label: 'Select specialization' },
  { value: 'Fitness Trainer', label: 'Fitness Trainer' },
  { value: 'Nutrition Trainer', label: 'Nutrition Trainer' },
  { value: 'Yoga Trainer', label: 'Yoga Trainer' },
  { value: 'Strength & Conditioning', label: 'Strength & Conditioning' },
  { value: 'Cardio Specialist', label: 'Cardio Specialist' },
];

export default function TrainerForm({ params }: TrainerFormProps) {
  const router = useRouter();
 
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    specialization: '',
    age: '',
    mobile: '',
    role: 'trainer'
  });
  const [password, setPassword] = useState('');


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if ( params.id) {
      // Fetch trainer data if in edit mode
      fetchData(`users/${params.id}`, (data?: any) => {
        if (data) {
          setFormData(data);
        } else {
          setError('Trainer not found');
        }
      });
    }
  }, [ params.id]);

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
    setLoading(true);
    setError('');

    try {
      if ( params.id) {
        await updateData(`users/${params.id}`, formData);
      } else {
        await addData('users', formData);
      }
      router.push('/trainers');
    } catch (err) {
      setError('Failed to save trainer data');
      console.error(err);
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
          <CardTitle>{'Edit Trainer'}</CardTitle>
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
                {loading ? 'Saving...' :  'Update Trainer' }
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