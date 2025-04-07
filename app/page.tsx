"use client";
import Image from "next/image";
import { Input } from "antd";
import { useState } from "react";
import data from "./data.json";

const { Search } = Input;

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState(data);
  
  const onSearch = (value: string) => {
    if (!value.trim()) {
      setSearchResults(data);
      return;
    }
    
    const filteredResults = data.filter(item => {
      const searchTerm = value.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.apm_application_code.toLowerCase().includes(searchTerm)
      );
    });
    
    setSearchResults(filteredResults);
    console.log("Search results:", filteredResults);
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <div className="w-full max-w-md mb-4">
          <Search
            placeholder="Search applications..."
            allowClear
            enterButton={false}
            size="large"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);
              
              if (!value.trim()) {
                setSearchResults(data);
                return;
              }
              
              const filteredResults = data.filter(item => {
                const searchTerm = value.toLowerCase();
                return (
                  item.name.toLowerCase().includes(searchTerm) ||
                  item.description.toLowerCase().includes(searchTerm) ||
                  item.apm_application_code.toLowerCase().includes(searchTerm)
                );
              });
              
              setSearchResults(filteredResults);
            }}
            onSearch={onSearch}
          />
        </div>
        
        <div className="w-full max-w-4xl">
          {searchResults.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((app) => (
                <div key={app.apm_application_code} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold">{app.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">Code: {app.apm_application_code}</p>
                  <p className="text-sm mb-2">{app.description}</p>
                  <div className="text-xs text-gray-500">
                    <p>Lifecycle: {app.lifecycle}</p>
                    <p>Contact: {app.application_contact}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <p>No applications found matching your search.</p>
            </div>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
