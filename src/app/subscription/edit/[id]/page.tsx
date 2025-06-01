'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ref, get, update } from 'firebase/database';
import { database } from '@/config/firebaseConfig';
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Save, X, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface FormData {
  name: string;
  description: string;
  type: string;
  validForOnsite: boolean;
  validForMobile: boolean;
  active: boolean;
  price: string;
  duration: string;
  features: string[];
}

const SUBSCRIPTION_TYPES = [
  'Basic',
  'Premium',
  'Enterprise',
  'Trial',
  'Student',
  'Professional'
];

const DURATION_OPTIONS = [
  'monthly',
  'quarterly',
  'yearly',
  'lifetime'
];

export default function EditSubscription() {
  const params = useParams();
  const router = useRouter();
  const subscriptionId = params.id as string;
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: 'Basic',
    validForOnsite: true,
    validForMobile: true,
    active: true,
    price: '',
    duration: 'monthly',
    features: []
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

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
          const sub = {
            id: subscriptionId,
            ...subscriptionData,
          };
          
          setSubscription(sub);
          setFormData({
            name: sub.name || '',
            description: sub.description || '',
            type: sub.type || 'Basic',
            validForOnsite: sub.validForOnsite ?? true,
            validForMobile: sub.validForMobile ?? true,
            active: sub.active ?? true,
            price: sub.price ? sub.price.toString() : '',
            duration: sub.duration || 'monthly',
            features: sub.features || []
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

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = 'Price must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        validForOnsite: formData.validForOnsite,
        validForMobile: formData.validForMobile,
        active: formData.active,
        updatedAt: new Date().toISOString(),
        features: formData.features
      };

      // Only include price if it's provided
      if (formData.price.trim()) {
        updateData.price = Number(formData.price);
      }

      // Only include duration if price is provided
      if (formData.price.trim()) {
        updateData.duration = formData.duration;
      }

      const subscriptionRef = ref(database, `subscriptions/${subscriptionId}`);
      await update(subscriptionRef, updateData);
      
      setSuccess('Subscription updated successfully!');
      
      // Redirect to details page after a short delay
      setTimeout(() => {
        router.push(`/subscription/details/${subscriptionId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('Failed to update subscription. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2">Loading subscription...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error && !subscription) {
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
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
              <h1 className="text-2xl font-bold">Edit Subscription</h1>
              <p className="text-gray-600">{subscription?.name}</p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter subscription name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter subscription description"
                      rows={3}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {SUBSCRIPTION_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        className={errors.price ? 'border-red-500' : ''}
                      />
                      {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                    </div>
                  </div>

                  {formData.price && (
                    <div>
                      <Label htmlFor="duration">Billing Duration</Label>
                      <select
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {DURATION_OPTIONS.map(duration => (
                          <option key={duration} value={duration}>
                            {duration.charAt(0).toUpperCase() + duration.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button type="button" onClick={addFeature} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.features.length > 0 && (
                    <div className="space-y-2">
                      <Label>Current Features:</Label>
                      <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span>{feature}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFeature(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Platform Settings */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="validForOnsite">Onsite Access</Label>
                    <Switch
                      id="validForOnsite"
                      checked={formData.validForOnsite}
                      onCheckedChange={(checked) => handleInputChange('validForOnsite', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="validForMobile">Mobile Access</Label>
                    <Switch
                      id="validForMobile"
                      checked={formData.validForMobile}
                      onCheckedChange={(checked) => handleInputChange('validForMobile', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="active">Active Status</Label>
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => handleInputChange('active', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Current Status */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant={formData.active ? "default" : "secondary"}
                    className={`${
                      formData.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {formData.active ? 'Active' : 'Inactive'}
                  </Badge>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>

                  <Link href={`/subscription/details/${subscriptionId}`} className="block">
                    <Button type="button" variant="outline" className="w-full">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
}