"use client";

import { AlertCircle } from "lucide-react";

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

const Error: React.FC<ErrorProps> = ({
  message = "Something went wrong.",
  onRetry,
}) => {
  return (
    <div className="h-full flex flex-col justify-center items-center gap-4 text-center">
      <AlertCircle className="size-12 text-red-600" />
      <p className="text-4xl font-semibold text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default Error;
