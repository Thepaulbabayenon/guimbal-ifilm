'use client';
import React, { createContext, useContext, useState } from "react";

export const UpdateContext = createContext<any>(null);

export const UpdateProvider = ({ children }: { children: React.ReactNode }) => {
  const [updateKey, setUpdateKey] = useState(0);

  const triggerUpdate = () => setUpdateKey((prev) => prev + 1);

  return (
    <UpdateContext.Provider value={{ updateKey, triggerUpdate }}>
      {children}
    </UpdateContext.Provider>
  );
};

export const useUpdateContext = () => useContext(UpdateContext);
