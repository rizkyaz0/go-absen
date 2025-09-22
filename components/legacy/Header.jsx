"use client";

import { Menu } from "@headlessui/react"; // Headless UI

export default function Header({ name }) {
  return (
    <header className="bg-dark shadow p-4 flex justify-between items-center">
      <h1 className="font-semibold text-lg">Hi, {name}</h1>

      {/* Menu Dropdown (Headless UI) */}
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="px-3 py-2 rounded-lg bg-dark hover:bg-gray-800 text-sm">
          ☰
        </Menu.Button>

        <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-lg shadow-lg">
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? "bg-gray-300 hover:rounded-lg" : ""
                } w-full text-left px-4 py-2 text-sm text-black`}
              >
                Profil
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? "bg-gray-300 rounded-lg" : ""
                } w-full text-left px-4 py-2 text-sm text-red-500`}
              >
                Logout
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </header>
  );
}
