"use client";
import Image from "next/image";
import { Input, Card, Typography, Divider, Tag, Space, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import data from "./data.json";

// Define the type for application data
interface Application {
  apm_application_code: string;
  name: string;
  description: string;
  lifecycle: string;
  critical_information_asset: string;
  appsec_release_assessment_required: string;
  application_contact: string;
  application_contact_email: string;
  application_contact_title: string;
  it_manager: string;
  it_manager_email: string;
  it_manager_title: string;
  it_vp: string;
  it_vp_email: string;
  it_vp_title: string;
  user_interface: string;
}

const { Search } = Input;
const { Text, Title, Paragraph } = Typography;

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Application[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Initialize loading state and ensure data is loaded client-side
  useEffect(() => {
    try {
      // This ensures data is loaded client-side
      if (data && Array.isArray(data)) {
        console.log("Data loaded successfully:", data.length, "applications");
      } else {
        console.error("Data is not in expected format:", data);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error("Error loading data:", error);
      message.error("Failed to load application data. Please refresh the page.");
      setIsLoaded(true);
    }
  }, []);
  
  const onSearch = (value: string) => {
    try {
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
      console.log("Search results:", filteredResults.length, "applications found");
    } catch (error) {
      console.error("Error during search:", error);
      message.error("An error occurred during search. Please try again.");
    }
  };
  return (
    <div className="flex flex-col min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full flex justify-center py-4 sticky top-0 bg-white z-10 border-b">
        <div className="w-full max-w-2xl">
          <Search
            placeholder="Search by name, APM code, or description"
            allowClear
            enterButton={false}
            size="large"
            value={searchValue}
            onChange={(e) => {
              try {
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
              } catch (error) {
                console.error("Error during search input:", error);
                message.error("An error occurred while searching. Please try again.");
              }
            }}
            onSearch={onSearch}
          />
        </div>
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
          ) : searchResults.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((app) => (
                <Card 
                  key={app.apm_application_code}
                  title={
                    <div>
                      <Title level={4} style={{ margin: 0 }}>{app.name}</Title>
                      <Text type="secondary">Code: {app.apm_application_code}</Text>
                    </div>
                  }
                  hoverable
                  style={{ height: '100%' }}
                >
                  
                    <div style={{ marginBottom: '12px' }}>
                      <Tag color={app.lifecycle === "Production" ? "green" : "blue"}>{app.lifecycle}</Tag>
                      <Tag color={app.critical_information_asset === "Yes" ? "red" : "default"}>
                        CIA: {app.critical_information_asset}
                      </Tag>
                      <Tag color={app.appsec_release_assessment_required === "Yes" ? "orange" : "default"}>
                        AppSec: {app.appsec_release_assessment_required}
                      </Tag>
                    </div>
                  <div>
                    <Paragraph>{app.description}</Paragraph>
                    
                    
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
                        <a href={`mailto:${app.it_manager_email}`}>
                          <Space>
                            <MailOutlined />
                            <Text type="secondary">{app.it_manager_email}</Text>
                          </Space>
                        </a>
                      </div>
                      
                      <div style={{ flex: '1 1 30%', minWidth: '200px' }}>
                        <Text strong>IT VP:</Text> {app.it_vp} ({app.it_vp_title})
                        <br />
                        <a href={`mailto:${app.it_vp_email}`}>
                          <Space>
                            <MailOutlined />
                            <Text type="secondary">{app.it_vp_email}</Text>
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
        </div>
      </main>
      <footer className="flex gap-[24px] flex-wrap items-center justify-center py-4">
      </footer>
    </div>
  );
}
