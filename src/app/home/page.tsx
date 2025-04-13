"use client"
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import SettingBoxes from "@/components/SettingBoxes";
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database } from "@/config/firebaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaBox, FaUsers, FaUserTie, FaClipboardList } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const metadata: Metadata = {
  title: "Push and Pull Fitness",
  description: "This is Push and Pull Fitness App",
};

const Home = () => {
  const [packageData, setPackageData] = useState<{ labels: string[], datasets: { label: string, data: number[], backgroundColor: string, borderColor: string, borderWidth: number }[] }>({ labels: [], datasets: [] });
  const [totalPackages, setTotalPackages] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalTrainers, setTotalTrainers] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    const fetchPackages = async () => {
      const packagesRef = ref(database, 'packages');
      const snapshot = await get(packagesRef);
      const packages = snapshot.val();

      const goalCounts: { [key: string]: number } = {};
      for (const key in packages) {
        const goal = packages[key].customerGoal;
        if (goalCounts[goal]) {
          goalCounts[goal]++;
        } else {
          goalCounts[goal] = 1;
        }
      }

      const labels = Object.keys(goalCounts);
      const data = Object.values(goalCounts);

      setPackageData({
        labels,
        datasets: [
          {
            label: 'Packages by Customer Goal',
            data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1,
          },
        ],
      });

      setTotalPackages(Object.keys(packages).length);
    };

    const fetchUsers = async () => {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      const users = snapshot.val();

      let customerCount = 0;
      let trainerCount = 0;

      for (const key in users) {
        if (users[key].role === 'customer') {
          customerCount++;
        } else if (users[key].role === 'trainer') {
          trainerCount++;
        }
      }

      setTotalCustomers(customerCount);
      setTotalTrainers(trainerCount);
    };

    const fetchRequests = async () => {
      const requestsRef = ref(database, 'requests');
      const snapshot = await get(requestsRef);
      const requests = snapshot.val();

      setTotalRequests(Object.keys(requests).length);
    };

    fetchPackages();
    fetchUsers();
    fetchRequests();
  }, []);

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[1080px]">
        <Breadcrumb pageName="Home" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          <Card className="bg-[rgb(10,189,202)] text-white">
            <CardHeader className="flex items-center">
              <FaBox className="m-2" size={32} />
              <CardTitle>Total Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center">{totalPackages}</p>
            </CardContent>
          </Card>
          <Card className="bg-[rgb(10,189,202)] text-white">
            <CardHeader className="flex items-center">
              <FaUsers className="m-2" size={32} />
              <CardTitle>Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center">{totalCustomers}</p>
            </CardContent>
          </Card>
          <Card className="bg-[rgb(10,189,202)] text-white">
            <CardHeader className="flex items-center">
              <FaUserTie className="m-2" size={32} />
              <CardTitle>Total Trainers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center">{totalTrainers}</p>
            </CardContent>
          </Card>
          <Card className="bg-[rgb(10,189,202)] text-white">
            <CardHeader className="flex items-center">
              <FaClipboardList className="m-2" size={32} />
              <CardTitle>Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center">{totalRequests}</p>
            </CardContent>
          </Card>
        </div>

        <div className="my-8 bg-white p-4 rounded-[10px] shadow-1 dark:bg-gray-dark dark:shadow-card">
          <Bar data={packageData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Packages by Customer Goal' } } }} />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Home;
