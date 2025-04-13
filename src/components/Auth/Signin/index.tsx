"use client";
import Link from "next/link";
import React from "react";
import GoogleSigninButton from "../GoogleSigninButton";
import SigninWithPassword from "../SigninWithPassword";

export default function Signin() {
  return (
    <>
      
      <div className="mt-1">
        <SigninWithPassword />
      </div>

      <div className="mt-4 text-center">
        {/* <p>
          Don’t have any account?{" "}
          <Link href="/auth/signup" className="text-primary">
            Sign Up
          </Link>
        </p> */}
      </div>
    </>
  );
}
