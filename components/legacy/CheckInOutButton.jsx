"use client";

export default function CheckInOutButton({ isCheckedIn, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full py-4 text-lg font-bold rounded-xl shadow ${
        isCheckedIn
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-green-500 text-white hover:bg-green-600"
      }`}
    >
      {isCheckedIn ? "Check-out" : "Check-in"}
    </button>
  );
}
