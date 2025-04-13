import { ref, push } from 'firebase/database';
import { database } from '@/config/firebaseConfig';

const sendCustomerNotification = async (userId, trainerId, type, title, content) => {
  const notificationRef = ref(database, `customerNotifications/${userId}`);
  const newNotification = {
    id: Date.now().toString(),
    message: content,
    read: false,
    timestamp: new Date().toISOString(),
    trainerId: trainerId,
    type: type,
    details: {
      title: title,
      content: content,
    },
  };
  await push(notificationRef, newNotification);
};

const sendTrainerNotification = async (
  trainerId,
  customerId,
  type,
  message,
  details,
  packageId,
  planId,
  progressId
) => {
  const notificationRef = ref(database, `trainerNotifications/${trainerId}`);
  const newNotification = {
    customerId: customerId,
    details: details,
    id: Date.now().toString(),
    message: message,
    packageId: packageId,
    planId: planId,
    progressId: progressId,
    read: false,
    timestamp: new Date().toISOString(),
    type: type,
  };

  await push(notificationRef, newNotification);
};

export { sendCustomerNotification, sendTrainerNotification };
