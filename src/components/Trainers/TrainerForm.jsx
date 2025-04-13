import React, { useState, useEffect } from "react";
import { database } from "../../app/firebaseFunctions/firebaseConfig";
import { ref, set, update, push } from "firebase/database";
import InputGroup from "@/components/FormElements/InputGroup";

const TrainerForm = ({ trainer, onClose }) => {
  // Separate state fields for each input
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [age, setAge] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("trainer");

  // Update state when trainer prop changes
  useEffect(() => {
    console.log(trainer);
    if (trainer) {
      setDisplayName(trainer.displayName || "");
      setEmail(trainer.email || "");
      setSpecialization(trainer.specialization || "");
      setAge(trainer.age || "");
      setMobile(trainer.mobile || "");
      setRole(trainer.role || "trainer");
    }
  }, [trainer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trainersRef = ref(database, "users");
    const formData = { displayName, email, specialization, age, mobile, role };

    if (trainer) {
      // Update existing trainer
      const trainerRef = ref(database, `users/${trainer.id}`);
      await update(trainerRef, formData);
    } else {
      // Add new trainer
      const newTrainerRef = push(trainersRef);
      await set(newTrainerRef, formData);
    }

    onClose();
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
        <h3 className="font-semibold text-dark dark:text-white">
          {trainer ? "Edit Trainer" : "Add New Trainer"}
        </h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6.5">
          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <InputGroup
              label="Name"
              type="text"
              name="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter trainer name"
              customClasses="w-full xl:w-1/2"
            />

            <InputGroup
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              customClasses="w-full xl:w-1/2"
            />
          </div>

          <div className="mb-4.5">
            <InputGroup
              label="Specialization"
              type="text"
              name="specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Enter specialization"
              customClasses="mb-4.5"
            />
          </div>

          <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
            <InputGroup
              label="Age"
              type="number"
              name="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age"
              customClasses="w-full xl:w-1/2"
            />

            <InputGroup
              label="Mobile"
              type="text"
              name="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
              customClasses="w-full xl:w-1/2"
            />
          </div>

          <div className="flex gap-4.5">
            <button
              type="submit"
              className="flex w-full justify-center rounded-[7px] bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
            >
              {trainer ? "Update Trainer" : "Add Trainer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex w-full justify-center rounded-[7px] border border-stroke bg-transparent p-[13px] font-medium text-dark hover:bg-opacity-90 dark:border-dark-3 dark:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TrainerForm;
