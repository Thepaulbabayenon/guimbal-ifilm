import { useState } from "react";

interface EditProfileFormProps {
  user: { name?: string; imageUrl?: string };
  onUpdate: (updatedUser: { name: string; imageUrl?: string }) => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({ name: user.name || "", imageUrl: user.imageUrl || "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onUpdate(formData);
      }}
      className="bg-white shadow-lg rounded-2xl p-6 flex flex-col gap-4"
    >
      <input
        type="text"
        name="name"
        placeholder="Enter your name"
        value={formData.name}
        onChange={handleChange}
        className="border p-2 rounded-md text-black"
      />
      <input
        type="text"
        name="imageUrl"
        placeholder="Profile image URL"
        value={formData.imageUrl}
        onChange={handleChange}
        className="border p-2 rounded-md text-black"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
        Save Changes
      </button>
    </form>
  );
};

export default EditProfileForm;
