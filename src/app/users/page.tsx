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
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Link from "next/link";


interface Trainer {
  id: string;
  displayName: string;
  email: string;
  mobile: string;
  goal: string;
  freetrial?: boolean;
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

const Users = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  useEffect(() => {
    const trainersRef = ref(database, "users");

    const unsubscribe = onValue(trainersRef, (snapshot) => {
      const data = snapshot.val() as Record<string, FirebaseUser>;
      const trainerList = Object.entries(data || {})
        .filter(([id, user]) => user.role != "trainer")
        .map(([id, user]) => ({
          id,
          displayName: user.displayName,
          email: user.email,
          mobile: user.mobile || "",
          goal: user.goal || "",
          freetrial: user.freetrial || false,
        }));
      setTrainers(trainerList);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteTrainer = async (id : string) => {
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

  

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[1080px]">
        <Breadcrumb pageName="Customers" />
        <div className="flex flex-col gap-10">
         
        <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Customers List</h2>
       
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
                    {trainer.mobile}
                  </p>
                </TableCell>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                    index === trainers.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <p className="text-dark dark:text-white">
                    {trainer.goal}
                  </p>
                </TableCell>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                    index === trainers.length - 1 ? "border-b-0" : "border-b"
                  }`}
                >
                  <p className="text-dark dark:text-white">
                    {trainer.freetrial? "Yes" : "No"}
                  </p>
                </TableCell>
                <TableCell
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5 ${
                    index === trainers.length - 1 ? "border-b-0" : "border-b"
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
      </div>
    </div>
        
        </div>
      
     
        
      </div>
    </DefaultLayout>
  );
};

export default Users;
