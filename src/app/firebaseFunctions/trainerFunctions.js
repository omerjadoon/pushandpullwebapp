import { getDatabase, ref, set, push, update, remove } from "firebase/database";

// Add new trainer
export const addTrainer = async (trainerData) => {
  const db = getDatabase();
  const trainersRef = ref(db, "users");
  const newTrainerRef = push(trainersRef);
  await set(newTrainerRef, trainerData);
};

// Update trainer
export const updateTrainer = async (id, updatedData) => {
  const db = getDatabase();
  const trainerRef = ref(db, `users/${id}`);
  await update(trainerRef, updatedData);
};

// Delete trainer
export const deleteTrainer = async (id) => {
  const db = getDatabase();
  const trainerRef = ref(db, `users/${id}`);
  await remove(trainerRef);
};
