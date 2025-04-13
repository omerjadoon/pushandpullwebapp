import React, { useEffect, useState } from "react";
import { database } from "../../app/firebaseFunctions/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { deleteTrainer } from "../../app/firebaseFunctions/trainerFunctions";
import TrainerForm from "./TrainerForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Link from "next/link";

const TrainerList = () => {
  const [trainers, setTrainers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  useEffect(() => {
    const trainersRef = ref(database, "users");

    const unsubscribe = onValue(trainersRef, (snapshot) => {
      const data = snapshot.val();
      const trainerList = Object.entries(data || {})
        .filter(([id, user]) => user.role === "trainer")
        .map(([id, user]) => ({ id, ...user }));
      setTrainers(trainerList);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteTrainer = async (id) => {
    try {
      await deleteTrainer(id);
      console.log("Trainer deleted successfully!");
    } catch (error) {
      console.error("Error deleting trainer:", error);
    }
  };

  const handleAddTrainer = () => {
    setSelectedTrainer(null);
    setShowForm(true);
  };

  const handleEditTrainer = (trainer) => {
    setSelectedTrainer(trainer);
    setShowForm(true);
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

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Trainer List</h2>
        <Link href="/trainers/add">
            <button
            className="bg-primary text-white px-4 py-2 rounded"
            // onClick={handleAddTrainer}
            >
            Add Trainer
            </button>
        </Link>
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
                Specialization
              </TableHead>
              <TableHead className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainers.map((trainer, index) => (
              <TableRow key={trainer.id}>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5 ${
                    index === trainers.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <h5 className="text-dark dark:text-white">
                    {trainer.displayName}
                  </h5>
                </TableCell>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                    index === trainers.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <p className="text-dark dark:text-white">
                    {trainer.email}
                  </p>
                </TableCell>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                    index === trainers.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <p className="text-dark dark:text-white">
                    {trainer.specialization}
                  </p>
                </TableCell>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5 ${
                    index === trainers.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <div className="flex items-center justify-end space-x-3.5">
                  <Link href={`/trainers/${trainer.id}`}>
                    <button
                      className="hover:text-primary"
                    //   onClick={() => handleEditTrainer(trainer)}
                    >
                      <FiEdit2 className="h-5 w-5" />
                    </button>
                  </Link>
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
      </div>
    </div>
  );
};

export default TrainerList;
