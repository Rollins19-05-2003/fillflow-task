'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { BsDot } from 'react-icons/bs';
import Link from 'next/link';
import './sidebar.css';

const Sidebar = ({ items }) => {
  const [activeItems, setActiveItems] = useState([]);

  const handleItemClick = (item) => {
    const newActiveItems = [...activeItems];
    const itemIndex = activeItems.findIndex(
      (activeItem) => activeItem.id === item.id
    );

    if (itemIndex !== -1) {
      newActiveItems.splice(itemIndex, 1); // Remove item if it's already active
    } else {
      newActiveItems.push(item); // Add item if it's not active
    }

    setActiveItems(newActiveItems);
  };

  const renderSubItems = (subItems, depth = 0) => {
    return subItems.map((subItem) => (
      <div key={subItem.id}>
        {subItem.subItems ? (
          <>
            {/* Nested Parent Item */}
            <button
              className="w-full text-[1vw] gap-4  py-[1vw] px-1 text-left flex items-center justify-start hover:cursor-pointer"
              onClick={() => handleItemClick(subItem)}
            >
              <span>{subItem.label}</span>
              {/* Nested Arrow Icon */}
              {activeItems.find(
                (activeItem) => activeItem.id === subItem.id
              ) ? (
                <IoIosArrowUp className="h-[1.1vw] w-[1.1vw] text-gray-500" />
              ) : (
                <IoIosArrowDown className="h-[1.1vw] w-[1.1vw] text-gray-500" />
              )}
            </button>
            {/* Nested Sub Items */}
            <div
              className={`pl-4 transition-max-height ${
                activeItems.find((activeItem) => activeItem.id === subItem.id)
                  ? 'max-h-screen transition duration-500 ease-in-out delay-200'
                  : 'max-h-0 transition duration-300 ease-in-out'
              } overflow-hidden text-[1vw]`}
            >
              {renderSubItems(subItem.subItems, depth + 1)}
            </div>
          </>
        ) : (
          // No further nesting, render link
          <a href={subItem.path} key={subItem.id}>
            <div className="flex items-center">
              {Array.from({ length: depth }, (_, i) => (
                <BsDot key={i} />
              ))}
              <button className="w-full text-[1vw] py-2 px-[0.5vw] text-left hover:cursor-pointer">
                {subItem.label}
              </button>
            </div>
          </a>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col w-[23vw] h-screen bg-[#F8F6F2] font-medium text-[#838481]">
      <div className="flex flex-col px-4 py-6">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Link href="/storage/inventory_level">
              <Image alt="" width={130} height={40} src={"/logo.svg"} />
          </Link>
        </div>
        {/* Sidebar Items */}
        <div className="scroll_width mt-[2vw] h-[75vh] overflow-y-scroll ">
          {items.map((item) => (
            <div key={item.id}>
              {/* Parent Item */}
              <button
                className="w-full text-[1.15vw] font-semibold  py-[1vw] px-4 text-left flex items-center justify-between hover:cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <span>{item.label}</span>
                {/* Arrow Icon */}
                {activeItems.find((activeItem) => activeItem.id === item.id) ? (
                  <IoIosArrowUp className="h-[1.1vw] w-[1.1vw] text-gray-500" />
                ) : (
                  <IoIosArrowDown className="h-[1.1vw] w-[1.1vw] text-gray-500" />
                )}
              </button>
              {/* Sub Items */}
              <div
                className={`pl-4  transition-max-height ${
                  activeItems.find((activeItem) => activeItem.id === item.id)
                    ? "max-h-screen transition duration-500 ease-in-out delay-200"
                    : "max-h-0 transition duration-300 ease-in-out"
                } overflow-hidden text-[1.15vw]`}
              >
                {renderSubItems(item.subItems)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
