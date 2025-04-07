"use client";
import Image from "next/image";
import { Input, Card, Typography, Divider, Tag, Space, message, Button, Pagination } from "antd";
import { MailOutlined, TableOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import Link from "next/link";
import data from "./data.json";
import { Application, initializeDatabase, searchApplications } from "./utils/db";

const { Search } = Input;
const { Text, Title, Paragraph } = Typography;

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Application[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // Initialize loading state and ensure data is loaded into IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize IndexedDB with our data
        if (data && Array.isArray(data)) {
          await initializeDatabase(data);
          console.log("Data loaded successfully into IndexedDB:", data.length, "applications");
        } else {
          console.error("Data is not in expected format:", data);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading data into IndexedDB:", error);
        message.error("Failed to load application data. Please refresh the page.");
        setIsLoaded(true);
      }
    };
    
    loadData();
  }, []);
  
  const onSearch = async (value: string, page: number = 1) => {
    try {
      setIsSearching(true);
      
      if (!value.trim()) {
        setSearchResults([]);
        setTotalResults(0);
        setIsSearching(false);
        return;
      }
      
      // Use IndexedDB to search with pagination
      const { results, total } = await searchApplications(value, page, pageSize);
      
      setSearchResults(results);
      setTotalResults(total);
      setCurrentPage(page);
      console.log("Search results:", results.length, "applications found, total:", total);
      setIsSearching(false);
    } catch (error) {
      console.error("Error during search:", error);
      message.error("An error occurred during search. Please try again.");
      setIsSearching(false);
    }
  };
  return (
    <div className="flex flex-col min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full flex justify-between items-center py-4 sticky top-0 bg-white z-10 border-b px-4">
        <div className="w-full max-w-2xl">
          <Search
            placeholder="Search by name, APM code, or description"
            allowClear
            enterButton={false}
            size="large"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);
              
              if (!value.trim()) {
                setSearchResults([]);
                setTotalResults(0);
                return;
              }
              
              // Debounce search to avoid excessive database operations
              const debounceTimer = setTimeout(() => {
                onSearch(value);
              }, 300);
              
              return () => clearTimeout(debounceTimer);
            }}
            onSearch={(value) => onSearch(value)}
            loading={isSearching}
          />
        </div>
        <Link href="/table">
          <Button type="primary" icon={<TableOutlined />}>
            Table View
          </Button>
        </Link>
      </header>
      
      <main className="flex flex-col items-center flex-grow pt-20">
        <div className="w-full max-w-6xl">
          {!isLoaded ? (
            <Card loading className="text-center">
              <Text>Loading applications...</Text>
            </Card>
          ) : !searchValue.trim() ? (
            <Card className="text-center">
              <Text>Start typing to search for applications...</Text>
            </Card>
          ) : isSearching ? (
            <Card loading className="text-center">
              <Text>Searching applications...</Text>
            </Card>
          ) : searchResults.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((app) => (
                <Card 
                  key={app.apm_application_code}
                  title={
                    <div>
                      <Title level={4} style={{ margin: 0 }}>{app.application_name}</Title>
                      <Text type="secondary">Code: {app.apm_application_code}</Text>
                    </div>
                  }
                  hoverable
                  style={{ height: '100%' }}
                >
                  
                    <div style={{ marginBottom: '12px' }}>
                      <Tag color={app.application_lifecycle === "Production" ? "green" : "blue"}>{app.application_lifecycle}</Tag>
                      <Tag color={app.critical_information_asset === "Yes" ? "red" : "default"}>
                        CIA: {app.critical_information_asset}
                      </Tag>
                      <Tag color={app.application_security_release_assessment_required === "Yes" ? "orange" : "default"}>
                        AppSec: {app.application_security_release_assessment_required}
                      </Tag>
                    </div>
                  <div>
                    <Paragraph>{app.application_description}</Paragraph>
                    
                    
                    <Text type="secondary">User Interface: {app.user_interface}</Text>
                    
                    <Divider orientation="left">Contacts</Divider>
                    
                    <div style={{ fontSize: '12px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ flex: '1 1 30%', minWidth: '200px' }}>
                        <Text strong>Application Contact:</Text> {app.application_contact} ({app.application_contact_title})
                        <br />
                        <a href={`mailto:${app.application_contact_email}`}>
                          <Space>
                            <MailOutlined />
                            <Text type="secondary">{app.application_contact_email}</Text>
                          </Space>
                        </a>
                      </div>
                      
                      <div style={{ flex: '1 1 30%', minWidth: '200px' }}>
                        <Text strong>IT Manager:</Text> {app.it_manager} ({app.it_manager_title})
                        <br />
                        <a href={`mailto:${app.itmanageremail}`}>
                          <Space>
                            <MailOutlined />
                            <Text type="secondary">{app.itmanageremail}</Text>
                          </Space>
                        </a>
                      </div>
                      
                      <div style={{ flex: '1 1 30%', minWidth: '200px' }}>
                        <Text strong>IT VP:</Text> {app.it_vp} ({app.it_vp_title})
                        <br />
                        <a href={`mailto:${app.itvpemail}`}>
                          <Space>
                            <MailOutlined />
                            <Text type="secondary">{app.itvpemail}</Text>
                          </Space>
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center">
              <Text>No applications found matching your search.</Text>
            </Card>
          )}
          
          {totalResults > pageSize && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalResults}
                onChange={(page) => onSearch(searchValue, page)}
                showSizeChanger={false}
                showTotal={(total) => `Total ${total} items`}
              />
            </div>
          )}
        </div>
      </main>
      <footer className="flex gap-[24px] flex-wrap items-center justify-center py-4">
      </footer>
    </div>
  );
}
