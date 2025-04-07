"use client";
import Image from "next/image";
import { Input, Card, Typography, Divider, Tag, Space } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import data from "./data.json";

const { Search } = Input;
const { Text, Title, Paragraph } = Typography;

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Initialize data on client side
  useEffect(() => {
    setSearchResults(data);
    setIsLoaded(true);
  }, []);
  
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
    <div className="flex flex-col min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full flex justify-center py-4 sticky top-0 bg-white z-10 border-b">
        <div className="w-full max-w-2xl">
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
      </header>
      
      <main className="flex flex-col items-center flex-grow pt-8">
        <div className="w-full max-w-6xl">
          {!isLoaded ? (
            <Card loading className="text-center">
              <Text>Loading applications...</Text>
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
                  <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
                    {/* Left side - App details */}
                    <div style={{ flex: '1 1 60%' }}>
                      <Paragraph>{app.description}</Paragraph>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <Tag color={app.lifecycle === "Production" ? "green" : "blue"}>{app.lifecycle}</Tag>
                        <Tag color={app.critical_information_asset === "Yes" ? "red" : "default"}>
                          CIA: {app.critical_information_asset}
                        </Tag>
                        <Tag color={app.appsec_release_assessment_required === "Yes" ? "orange" : "default"}>
                          AppSec: {app.appsec_release_assessment_required}
                        </Tag>
                      </div>
                      
                      <Text type="secondary">User Interface: {app.user_interface}</Text>
                    </div>
                    
                    {/* Right side - Contact information */}
                    <div style={{ flex: '1 1 40%', borderLeft: '1px solid #f0f0f0', paddingLeft: '16px', fontSize: '12px' }}>
                      <Title level={5} style={{ marginTop: 0 }}>Contacts</Title>
                      
                      <div style={{ marginBottom: '8px' }}>
                        <Text strong>Application Contact:</Text> {app.application_contact} ({app.application_contact_title})
                        <br />
                        <a href={`mailto:${app.application_contact_email}`}>
                          <Space>
                            <MailOutlined />
                            <Text type="secondary">{app.application_contact_email}</Text>
                          </Space>
                        </a>
                      </div>
                      
                      <div style={{ marginBottom: '8px' }}>
                        <Text strong>IT Manager:</Text> {app.it_manager} ({app.it_manager_title})
                        <br />
                        <a href={`mailto:${app.it_manager_email}`}>
                          <Space>
                            <MailOutlined />
                            <Text type="secondary">{app.it_manager_email}</Text>
                          </Space>
                        </a>
                      </div>
                      
                      <div>
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
