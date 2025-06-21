"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../../../app/firebaseFunctions/firebaseConfig";
import { useParams } from "next/navigation";
import { FiUser, FiMail, FiPhone, FiTarget, FiClock, FiMapPin, FiCalendar, FiActivity, FiMessageSquare } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AcceptedSuggestion {
  id: string;
  message: string;
  slot: string;
  suggestionId: string;
  trainer: string;
  customerId: string;
}

interface Customer {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
}

interface Package {
  id: string;
  title: string;
  customerGoal: string;
  customerId: string;
  customerName: string;
  endDate: string;
  height: number;
  isFreeTrial: boolean;
  startDate: string;
  subscriptionEndDate: string;
  subscriptionId: string;
  subscriptionStartDate: string;
  trainerId: string;
  weight: number;
}

interface Subscription {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface Trainer {
  id: string;
  displayName: string;
  email: string;
  specialization: string;
}

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
  activePackages: Package[];
  suggestions: AcceptedSuggestion[];
}

const TrainerCalendar = () => {
  const params = useParams();
  const trainerId = params.id as string;
  
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [packages, setPackages] = useState<Package[]>([]);
  const [subscriptions, setSubscriptions] = useState<Record<string, Subscription>>({});
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<AcceptedSuggestion[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    if (!trainerId) return;

    // Load trainer data
    const trainerRef = ref(database, `users/${trainerId}`);
    const unsubscribeTrainer = onValue(trainerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTrainer({ id: trainerId, ...data });
      }
    });

    // Load customers data
    const customersRef = ref(database, 'users');
    const unsubscribeCustomers = onValue(customersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const customersMap = Object.entries(data)
          .filter(([_, user]: [string, any]) => user.role === 'customer')
          .reduce((acc, [id, user]: [string, any]) => {
            acc[id] = { id, ...user };
            return acc;
          }, {} as Record<string, Customer>);
        setCustomers(customersMap);
      }
    });

    // Load packages data
    const packagesRef = ref(database, 'packages');
    const unsubscribePackages = onValue(packagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const trainerPackages = Object.entries(data)
          .filter(([_, pkg]: [string, any]) => pkg.trainerId === trainerId)
          .map(([id, pkg]: [string, any]) => ({ id, ...pkg }));
        setPackages(trainerPackages);
      }
    });

    // Load subscriptions data
    const subscriptionsRef = ref(database, 'subscriptions');
    const unsubscribeSubscriptions = onValue(subscriptionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const subscriptionsMap = Object.entries(data).reduce((acc, [id, sub]: [string, any]) => {
          acc[id] = { id, ...sub };
          return acc;
        }, {} as Record<string, Subscription>);
        setSubscriptions(subscriptionsMap);
      }
    });

      // Load accepted suggestions from user preferredSlots
  const usersRef = ref(database, 'users');
  const unsubscribeSlots = onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const allPreferredSlots: AcceptedSuggestion[] = [];

      Object.entries(data).forEach(([userId, user]: [string, any]) => {
        if (user?.role === 'customer' && user.preferredSlot) {
          allPreferredSlots.push({
            id: userId,
            suggestionId: `preferredSlot-${userId}`,
            customerId: userId,
            slot: user.preferredSlot,
            message: "Preferred slot from user profile",
            trainer: user.trainerId || ''
          });
        }
      });

      setAcceptedSuggestions(allPreferredSlots);
    }

    setLoading(false);
  });

    return () => {
      unsubscribeTrainer();
      unsubscribeCustomers();
      unsubscribePackages();
      unsubscribeSubscriptions();
      unsubscribeSlots(); // cleanup
      
    };
  }, [trainerId]);

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    
    // Add previous month's days
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayDate = new Date(year, month - 1, prevMonthDays - i);
      const dateString = dayDate.toISOString().split('T')[0];
      days.push({
        date: dateString,
        isCurrentMonth: false,
        activePackages: getActivePackagesForDate(dateString),
        suggestions: getSuggestionsForDate(dateString)
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const dateString = dayDate.toISOString().split('T')[0];
      days.push({
        date: dateString,
        isCurrentMonth: true,
        activePackages: getActivePackagesForDate(dateString),
        suggestions: getSuggestionsForDate(dateString)
      });
    }
    
    // Add next month's days to fill the grid
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    for (let i = days.length; i < totalCells; i++) {
      const dayDate = new Date(year, month + 1, nextMonthDay);
      const dateString = dayDate.toISOString().split('T')[0];
      days.push({
        date: dateString,
        isCurrentMonth: false,
        activePackages: getActivePackagesForDate(dateString),
        suggestions: getSuggestionsForDate(dateString)
      });
      nextMonthDay++;
    }
    
    return days;
  };

  const getActivePackagesForDate = (date: string): Package[] => {
    const targetDate = new Date(date);
    return packages.filter(pkg => {
      const startDate = new Date(pkg.subscriptionStartDate);
      const endDate = new Date(pkg.subscriptionEndDate);
      return targetDate >= startDate && targetDate <= endDate;
    });
  };

  const getSuggestionsForDate = (date: string): AcceptedSuggestion[] => {
    // For now, we'll show suggestions for active subscription days
    // You can modify this logic based on how you want to associate suggestions with specific dates
    const activePackages = getActivePackagesForDate(date);
    if (activePackages.length === 0) return [];
    
    const activeCustomerIds = activePackages.map(pkg => pkg.customerId);
    return acceptedSuggestions.filter(suggestion => 
      activeCustomerIds.includes(suggestion.customerId)
    );
  };

  const getSlotColor = (slot: string): string => {
    switch (slot.toLowerCase()) {
      case 'morning': return 'bg-yellow-500';
      case 'afternoon': return 'bg-blue-500';
      case 'evening': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getSlotTextColor = (slot: string): string => {
    switch (slot.toLowerCase()) {
      case 'morning': return 'text-yellow-700 bg-yellow-100';
      case 'afternoon': return 'text-blue-700 bg-blue-100';
      case 'evening': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.activePackages.length > 0 || day.suggestions.length > 0) {
      setSelectedDay(day);
      setShowDayDetails(true);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const calendarDays = getDaysInMonth(currentDate);
  const currentMonth = months[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  if (loading) {
    return (
      <DefaultLayout>
        <div className="mx-auto w-full max-w-[1080px]">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[1080px]">
        <Breadcrumb pageName={`${trainer?.displayName || 'Trainer'} Calendar`} />
        
        {/* Trainer Info Header */}
        <div className="mb-6 rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FiUser className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark dark:text-white">
                {trainer?.displayName || 'Trainer'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{trainer?.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Specialization: {trainer?.specialization}
              </p>
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="mb-6 rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              onClick={() => navigateMonth('prev')}
            >
              ← Previous
            </Button>
            <h3 className="text-xl font-bold text-dark dark:text-white">
              {currentMonth} {currentYear}
            </h3>
            <Button
              variant="outline"
              onClick={() => navigateMonth('next')}
            >
              Next →
            </Button>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mb-6 justify-center flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Subscription</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Morning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Afternoon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Evening</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center font-medium text-gray-600 dark:text-gray-400">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  min-h-[140px] p-2 border border-gray-200 dark:border-gray-700 cursor-pointer
                  hover:bg-gray-50 dark:hover:bg-gray-800 relative
                  ${!day.isCurrentMonth ? 'opacity-40' : ''}
                  ${day.activePackages.length > 0 ? 'bg-green-50 dark:bg-green-900/20' : ''}
                `}
                onClick={() => handleDateClick(day)}
              >
                <div className="text-sm font-medium text-dark dark:text-white mb-2">
                  {new Date(day.date).getDate()}
                </div>
                
                {/* Active subscription indicator */}
                {day.activePackages.length > 0 && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500"></div>
                )}
                
                {/* Customer-Slot List */}
                <div className="space-y-1 flex-1">
                  {day.suggestions.map((suggestion, suggestionIndex) => {
                    const customer = customers[suggestion.customerId];
                    const customerName = customer?.displayName || 'Unknown';
                    const slotName = suggestion.slot || 'No Slot';
                    
                    return (
                      <div
                        key={suggestionIndex}
                        className={`text-xs px-2 py-1 rounded-md ${getSlotTextColor(slotName)} border border-opacity-30`}
                        title={`${slotName} session with ${customerName}: ${suggestion.message}`}
                      >
                        <div className="font-medium text-center">
                          
                          <div className="truncate">{slotName}</div>
                          <div className="truncate"> .. {customerName}</div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Show active customers without suggestions */}
                  {day.activePackages.map((pkg, pkgIndex) => {
                    const hasExistingSuggestion = day.suggestions.some(s => s.customerId === pkg.customerId);
                    if (hasExistingSuggestion) return null;
                    
                    return (
                      <div
                        key={`pkg-${pkgIndex}`}
                        className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600 border border-gray-200"
                        title={`Active subscription: ${pkg.customerName}`}
                      >
                        <div className="font-medium text-center">
                          <div className="truncate">Active</div>
                          <div className="truncate">{pkg.customerName}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Day Details Modal */}
        <Dialog open={showDayDetails} onOpenChange={setShowDayDetails}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Training Details</DialogTitle>
              <DialogDescription>
                {selectedDay && new Date(selectedDay.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </DialogDescription>
            </DialogHeader>
            
            {selectedDay && (
              <div className="space-y-6">
                {/* Active Packages */}
                {selectedDay.activePackages.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Active Subscriptions</h4>
                    {selectedDay.activePackages.map((pkg, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FiTarget className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{pkg.title}</span>
                            {pkg.isFreeTrial && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Free Trial
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-600">Customer:</p>
                            <p className="font-medium">{pkg.customerName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Goal:</p>
                            <p className="font-medium">{pkg.customerGoal}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <FiActivity className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Height: {pkg.height} cm</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiActivity className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Weight: {pkg.weight} kg</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <FiCalendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Subscription Period:</span>
                          </div>
                          <p className="text-sm text-gray-600 ml-6">
                            {formatDate(pkg.subscriptionStartDate)} - {formatDate(pkg.subscriptionEndDate)}
                          </p>
                        </div>

                        {/* Customer Contact Info */}
                        {customers[pkg.customerId] && (
                          <div className="border-t pt-3 mt-3">
                            <p className="text-sm text-gray-600 mb-2">Contact Information:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="flex items-center gap-2">
                                <FiMail className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">{customers[pkg.customerId].email}</span>
                              </div>
                              {customers[pkg.customerId].phone && (
                                <div className="flex items-center gap-2">
                                  <FiPhone className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm">{customers[pkg.customerId].phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Accepted Suggestions */}
                {selectedDay.suggestions.length > 0 && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold text-lg">Training Suggestions</h4>
                    {selectedDay.suggestions.map((suggestion, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          
                          <div className="flex items-center gap-2">
                          Training Slot :
                            <div className={`w-3 h-3 rounded-full ${getSlotColor(suggestion.slot)}`}></div>
                             <span className="text-sm capitalize font-medium">{suggestion.slot}</span>
                          </div>
                        </div>
                        
                        

                       
                      </div>
                    ))}
                  </div>
                )}

                {/* No activity message */}
                {selectedDay.activePackages.length === 0 && selectedDay.suggestions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No training activities scheduled for this day.
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DefaultLayout>
  );
};

export default TrainerCalendar;