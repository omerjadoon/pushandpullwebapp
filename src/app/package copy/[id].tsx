import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { database } from "../firebaseFunctions/firebaseConfig";
import { ref, get } from "firebase/database";
import TrainerForm from "../../components/Trainers/TrainerForm";
import DefaultLayout from "../../components/Layouts/DefaultLaout"; // Assuming you have this layout component

const EditTrainer = () => {
  const router = useRouter();
  const { id } = router.query; // This will get the 'id' from the URL
  const [trainer, setTrainer] = useState<any>(null); // Trainer data (typed as `any` for now)

  useEffect(() => {
    if (!id) return; // Wait for the 'id' to be available

    // Fetch the trainer data by ID from Firebase
    const fetchTrainerData = async () => {
      const trainerRef = ref(database, `users/${id}`);
      const snapshot = await get(trainerRef);
      if (snapshot.exists()) {
        setTrainer(snapshot.val()); // Set the fetched trainer data
      }
    };

    fetchTrainerData();
  }, [id]);

  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[1080px]">
        <h1>Edit Trainer</h1>
        {trainer ? (
          <TrainerForm trainer={{ id, ...trainer }} onClose={() => router.push("/trainers")} />
        ) : (
          <p>Loading trainer data...</p>
        )}
      </div>
    </DefaultLayout>
  );
};

export default EditTrainer;
