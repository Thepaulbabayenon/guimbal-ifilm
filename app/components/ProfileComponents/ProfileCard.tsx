import Image from "next/image";

interface ProfileCardProps {
  user: {
    id: string;
    name?: string;
    imageUrl?: string;
    isAdmin?: boolean;
  };
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center text-center">
      <Image
        src={user.imageUrl || "/default-avatar.png"}
        alt="Profile Picture"
        width={100}
        height={100}
        className="rounded-full mb-4"
      />
      <h2 className="text-xl font-semibold text-black">{user.name || "Unnamed User"}</h2>
      {user.isAdmin && <span className="text-sm text-red-500 font-bold">Admin</span>}
    </div>
  );
};

export default ProfileCard;
