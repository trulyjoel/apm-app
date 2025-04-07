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
                  
                  <Divider orientation="left">Contacts</Divider>
                  
                  <div style={{ fontSize: '12px' }}>
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
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
