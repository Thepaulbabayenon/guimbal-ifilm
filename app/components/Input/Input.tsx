'use client';

import { 
  FieldErrors, 
  UseFormRegisterReturn // Import the correct type
} from "react-hook-form";
import { BiSearch } from "react-icons/bi";

interface InputProps {
  id: string;
  label?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  showSearchIcon?: boolean;
  register: UseFormRegisterReturn; // Updated type
  required?: boolean;
  errors: FieldErrors;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  placeholder = "Search...",
  type = "text", 
  disabled, 
  showSearchIcon,
  register,
  required,
  errors,
}) => {
  return (
    <div className="w-full relative">
      {showSearchIcon && (
        <BiSearch
          size={24}  
          className="
            text-neutral-500
            absolute
            top-5
            left-2
          "
        />
      )}
      <input
        id={id}
        disabled={disabled}
        {...register} // Spread the register object returned by `register(id)`
        placeholder={placeholder}
        type={type}
        className={`
          peer
          w-full
          p-4
          pt-6 
          font-light 
          bg-white 
          border-2
          rounded-md
          outline-none
          transition
          disabled:opacity-70
          disabled:cursor-not-allowed
          ${showSearchIcon ? 'pl-10' : 'pl-4'}
          ${errors[id] ? 'border-red-500' : 'border-neutral-300'}
          ${errors[id] ? 'focus:border-red-500' : 'focus:border-black'}
        `}
      />
      {label && (
        <label 
          className={`
            absolute 
            text-md
            duration-150 
            transform 
            -translate-y-3 
            top-5 
            z-10 
            origin-[0] 
            ${showSearchIcon ? 'left-10' : 'left-4'}
            peer-placeholder-shown:scale-100 
            peer-placeholder-shown:translate-y-0 
            peer-focus:scale-75
            peer-focus:-translate-y-4
            ${errors[id] ? 'text-red-500' : 'text-zinc-400'}
          `}
        >
          {label}
        </label>
      )}
    </div>
  );
}

export default Input;
