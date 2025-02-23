"use client";

import { useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import ProfileCard from "@/app/components/ProfileComponents/ProfileCard";
import EditProfileForm from "@/app/components/ProfileComponents/EditProfileForm";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserProfileDropdownProps {
  user: {
    id: string;
    name?: string;
    email: string;
    imageUrl?: string;
    isAdmin?: boolean;
  };
  onUpdate: (data: { name: string; imageUrl?: string }) => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-12 w-12 rounded-full">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.imageUrl || "/default-avatar.png"} alt={user.name || "User"} />
              <AvatarFallback>{user.name ? user.name[0] : "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-4 bg-white rounded-lg shadow-lg">
          {/* Profile Card */}
          <ProfileCard user={user} />

          {/* Edit Profile Form */}
          <EditProfileForm user={user} onUpdate={onUpdate} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfileDropdown;
