"use client";
import Image from "next/image";
import { Input } from "antd";
import { useState } from "react";

const { Search } = Input;

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  
  const onSearch = (value: string) => {
    console.log("Search:", value);
    // You can implement your search logic here
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <div className="w-full max-w-md mb-4">
          <Search
            placeholder="Search here..."
            allowClear
            enterButton="Search"
            size="large"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={onSearch}
          />
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
