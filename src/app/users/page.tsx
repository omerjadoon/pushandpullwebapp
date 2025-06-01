"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React, { useState, useEffect, useMemo } from "react";
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
import { FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
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
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter trainers based on search term
  const filteredTrainers = useMemo(() => {
    if (!searchTerm) return trainers;
    
    return trainers.filter((trainer) =>
      trainer.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.goal.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [trainers, searchTerm]);

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Customers List</h2>
              
              {/* Search Input */}
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent "
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="text-gray-400 hover:text-gray-600">×</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Summary */}
            {searchTerm && (
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Found {filteredTrainers.length} customer{filteredTrainers.length !== 1 ? 's' : ''} 
                {searchTerm && ` matching "${searchTerm}"`}
              </div>
            )}

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
                  {filteredTrainers.length > 0 ? (
                    filteredTrainers.map((trainer, index) => (
                      <TableRow key={trainer.id}>
                        <TableCell
                          className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5 ${
                            index === filteredTrainers.length - 1 ? "border-b-0" : "border-b"
                          }`}
                        >
                          <h5 className="text-dark dark:text-white">
                            {trainer.displayName}
                          </h5>
                        </TableCell>
                        <TableCell
                          className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                            index === filteredTrainers.length - 1 ? "border-b-0" : "border-b"
                          }`}
                        >
                          <p className="text-dark dark:text-white">
                            {trainer.email}
                          </p>
                        </TableCell>
                        <TableCell
                          className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                            index === filteredTrainers.length - 1 ? "border-b-0" : "border-b"
                          }`}
                        >
                          <p className="text-dark dark:text-white">
                            {trainer.mobile}
                          </p>
                        </TableCell>
                        <TableCell
                          className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                            index === filteredTrainers.length - 1 ? "border-b-0" : "border-b"
                          }`}
                        >
                          <p className="text-dark dark:text-white">
                            {trainer.goal}
                          </p>
                        </TableCell>
                        <TableCell
                          className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                            index === filteredTrainers.length - 1 ? "border-b-0" : "border-b"
                          }`}
                        >
                          <p className="text-dark dark:text-white">
                            {trainer.freetrial? "Yes" : "No"}
                          </p>
                        </TableCell>
                        <TableCell
                          className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5 ${
                            index === filteredTrainers.length - 1 ? "border-b-0" : "border-b"
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500 dark:text-gray-400">
                          {searchTerm ? (
                            <>
                              No customers found matching "{searchTerm}"
                              <br />
                              <button
                                onClick={() => setSearchTerm("")}
                                className="text-blue-500 hover:text-blue-700 mt-2 underline"
                              >
                                Clear search
                              </button>
                            </>
                          ) : (
                            "No customers found"
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
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