"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React, { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "../../app/firebaseFunctions/firebaseConfig";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FiEye, FiTrash2 } from "react-icons/fi";
import Link from "next/link";

interface Request {
  id: string;
  title: string;
  type: string;
  customer_id: string;
  status: string;
  datetime: string;
  customerName?: string; // Add this to store the customer's display name
}

const Requests = () => {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const requestsRef = ref(database, "requests");

    const unsubscribe = onValue(requestsRef, async (snapshot) => {
      const data = snapshot.val() as Record<string, Request>;
      const requestList = Object.entries(data || {}).map(([id, request]) => ({
        ...request,
      }));

      // Fetch customer names for each request
      const updatedRequests = await Promise.all(
        requestList.map(async (request) => {
          const customerRef = ref(database, `users/${request.customer_id}`);
          const customerSnapshot = await new Promise((resolve) =>
            onValue(
              customerRef,
              (snap) => {
                resolve(snap);
              },
              { onlyOnce: true }
            )
          );
          const customerData = (customerSnapshot as any).val();
          return {
            ...request,
            customerName: customerData?.displayName || "Unknown",
          };
        })
      );

      const sortedRequests = updatedRequests.sort((a, b) => 
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      );

      setRequests(sortedRequests);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteRequest = async (id: string) => {
    try {
      const requestRef = ref(database, `requests/${id}`);
      await remove(requestRef); // Use remove instead of requestRef.;
      console.log("Request deleted successfully!");
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[1080px]">
        <Breadcrumb pageName="Requests" />
        <div className="flex flex-col gap-10">
          <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Request List</h2>
            </div>

            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F7F9FC] text-left dark:bg-dark-2">
                    <TableHead className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                      Title
                    </TableHead>
                    <TableHead className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                      Type
                    </TableHead>
                    <TableHead className="min-w-[200px] px-4 py-4 font-medium text-dark dark:text-white">
                      Customer Name
                    </TableHead>
                    <TableHead className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                      Status
                    </TableHead>
                    <TableHead className="min-w-[200px] px-4 py-4 font-medium text-dark dark:text-white">
                      Datetime
                    </TableHead>
                    <TableHead className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request, index) => (
                    <TableRow key={request.id}>
                      <TableCell
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5 ${
                          index === requests.length - 1 ? "border-b-0" : "border-b"
                        }`}
                      >
                        <h5 className="text-dark dark:text-white">
                          {request.title}
                        </h5>
                      </TableCell>
                      <TableCell
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                          index === requests.length - 1 ? "border-b-0" : "border-b"
                        }`}
                      >
                        <p className="text-dark dark:text-white">
                          {request.type}
                        </p>
                      </TableCell>
                      <TableCell
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                          index === requests.length - 1 ? "border-b-0" : "border-b"
                        }`}
                      >
                        <p className="text-dark dark:text-white">
                          {request.customerName}
                        </p>
                      </TableCell>
                      <TableCell
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                          index === requests.length - 1 ? "border-b-0" : "border-b"
                        }`}
                      >
                        <p className="text-dark dark:text-white">
                          {request.status}
                        </p>
                      </TableCell>
                      <TableCell
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                          index === requests.length - 1 ? "border-b-0" : "border-b"
                        }`}
                      >
                        <p className="text-dark dark:text-white">
                          {new Date(request.datetime).toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5 ${
                          index === requests.length - 1 ? "border-b-0" : "border-b"
                        }`}
                      >
                        <div className="flex items-center justify-end space-x-3.5">
                          <Link href={`/requests/details/${request.id}`}>
                            <button className="hover:text-primary" title="View Details">
                              <FiEye className="h-5 w-5" />
                            </button>
                          </Link>
                          <button
                            className="hover:text-primary"
                            onClick={() => handleDeleteRequest(request.id)}
                            title="Delete"
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

export default Requests;
