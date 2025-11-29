import React from "react";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/mongoose";
import User from "@/models/User";
import UserProfile from "@/components/UserProfile";

export const metadata = {
  title: "Profile Settings | CRM Helpdesk",
};

export default async function ProfilePage() {
  const session = await auth();
  
  await connectToDB();
  
  const dbUser = await User.findById(session?.user.id).select(
    "name email organization website address isEmailConnected nylasGrantId");

  if (!dbUser) {
    return <div>User profile data not found.</div>;
  }

  const userData = {
    id: dbUser._id.toString(), 
    name: dbUser.name,
    email: dbUser.email,
    // image
    organization: dbUser.organization || "",
    website: dbUser.website || "",
    address: dbUser.address || "",
    isEmailConnected: dbUser.isEmailConnected,
    nylasGrantId: dbUser.nylasGrantId || undefined,
  };

  return (
    <main style={{  minHeight: '100vh', paddingBottom: '2rem' }}>
      <UserProfile user={userData} />
    </main>
  );
}