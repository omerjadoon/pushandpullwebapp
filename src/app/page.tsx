import ECommerce from "@/components/Dashboard/E-commerce";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import SignIn from "./auth/signin/page";

export const metadata: Metadata = {
  title:
    "Push and Pull Fitness",
  description: "Push and Pull Fitness App is the best fitness app",
};

export default function Home() {
  return (
    <>
      {/* <DefaultLayout>
        <ECommerce />
      </DefaultLayout> */}
      <SignIn />
    </>
  );
}
