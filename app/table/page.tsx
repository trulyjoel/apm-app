"use client";
import { Table, Typography, Tag, Button, Input, Space } from "antd";
import { MailOutlined, SearchOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { FilterConfirmProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import Link from "next/link";
import Fuse from 'fuse.js';
import data from "../data.json";

// Define the type for application data
interface Application {
  apm_application_code: string;
  application_name: string;
  application_description: string;
  application_lifecycle: string;
  critical_information_asset: string;
  application_security_release_assessment_required: string;
  application_contact: string;
  application_contact_email: string;
  application_contact_title: string;
  it_manager: string;
  itmanageremail: string;
  it_manager_title: string;
  it_vp: string;
  itvpemail: string;
  it_vp_title: string;
  user_interface: string;
  isusapp: string;
}

type DataIndex = keyof Application;

const { Title } = Typography;

export default function TablePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [fuse, setFuse] = useState<Fuse<Application> | null>(null);
  const searchInput = useRef<any>(null);

  useEffect(() => {
    try {
      if (data && Array.isArray(data)) {
        setApplications(data);
        setFilteredApplications(data);
        console.log("Data loaded successfully:", data.length, "applications");
        
        // Initialize Fuse.js with our data
        const fuseOptions = {
          keys: [
            'application_name',
            'apm_application_code',
            'application_description',
            'application_contact',
            'it_manager',
            'it_vp',
            'user_interface'
          ],
          threshold: 0.3,
          includeScore: true
        };
        
        setFuse(new Fuse(data, fuseOptions));
      } else {
        console.error("Data is not in expected format:", data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  }, []);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex,
  ) => {
    const searchValue = selectedKeys[0];
    confirm();
    setSearchText(searchValue);
    setSearchedColumn(dataIndex);
    
    // Use Fuse.js for global search if no specific column is selected
    if (fuse && searchValue && dataIndex === 'global') {
      const results = fuse.search(searchValue);
      setFilteredApplications(results.map(result => result.item));
    } else if (!searchValue) {
      setFilteredApplications(applications);
    }
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<Application> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns: ColumnsType<Application> = [
    {
      title: 'APM Code',
      dataIndex: 'apm_application_code',
      key: 'apm_application_code',
      width: 120,
      ...getColumnSearchProps('apm_application_code'),
      sorter: (a, b) => a.apm_application_code.localeCompare(b.apm_application_code),
    },
    {
      title: 'Name',
      dataIndex: 'application_name',
      key: 'application_name',
      width: 150,
      ...getColumnSearchProps('application_name'),
      sorter: (a, b) => a.application_name.localeCompare(b.application_name),
    },
    {
      title: 'Description',
      dataIndex: 'application_description',
      key: 'application_description',
      ...getColumnSearchProps('application_description'),
      ellipsis: true,
    },
    {
      title: 'Lifecycle',
      dataIndex: 'application_lifecycle',
      key: 'application_lifecycle',
      width: 120,
      filters: [
        { text: 'Production', value: 'Production' },
        { text: 'Development', value: 'Development' },
        { text: 'Testing', value: 'Testing' },
      ],
      onFilter: (value, record) => record.application_lifecycle === value,
      render: (text) => (
        <Tag color={text === 'Production' ? 'green' : 'blue'}>{text}</Tag>
      ),
    },
    {
      title: 'CIA',
      dataIndex: 'critical_information_asset',
      key: 'critical_information_asset',
      width: 80,
      filters: [
        { text: 'Yes', value: 'Yes' },
        { text: 'No', value: 'No' },
      ],
      onFilter: (value, record) => record.critical_information_asset === value,
      render: (text) => (
        <Tag color={text === 'Yes' ? 'red' : 'default'}>{text}</Tag>
      ),
    },
    {
      title: 'AppSec',
      dataIndex: 'application_security_release_assessment_required',
      key: 'application_security_release_assessment_required',
      width: 100,
      filters: [
        { text: 'Yes', value: 'Yes' },
        { text: 'No', value: 'No' },
      ],
      onFilter: (value, record) => record.application_security_release_assessment_required === value,
      render: (text) => (
        <Tag color={text === 'Yes' ? 'orange' : 'default'}>{text}</Tag>
      ),
    },
    {
      title: 'Application Contact',
      dataIndex: 'application_contact',
      key: 'application_contact',
      width: 180,
      render: (_, record) => (
        <>
          <div>{record.application_contact}</div>
          <div>
            <a href={`mailto:${record.application_contact_email}`}>
              <Space>
                <MailOutlined />
                <small>{record.application_contact_email}</small>
              </Space>
            </a>
          </div>
        </>
      ),
    },
    {
      title: 'UI Type',
      dataIndex: 'user_interface',
      key: 'user_interface',
      width: 120,
      filters: [
        { text: 'Externally Facing', value: 'Externally Facing' },
        { text: 'Internally Facing', value: 'Internally Facing' },
      ],
      onFilter: (value, record) => record.user_interface === value,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full flex justify-between items-center mb-8">
        <Title level={2}>Applications Table</Title>
        <Link href="/">
          <Button type="primary">Back to Search</Button>
        </Link>
      </header>
      
      <main className="flex-grow">
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Global search across all fields"
            allowClear
            enterButton
            onSearch={(value) => {
              if (fuse && value) {
                const results = fuse.search(value);
                setFilteredApplications(results.map(result => result.item));
              } else {
                setFilteredApplications(applications);
              }
            }}
          />
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredApplications}
          rowKey="apm_application_code"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 1200 }}
        />
      </main>
      
      <footer className="mt-8 text-center text-gray-500">
        <p>Application Portfolio Management</p>
      </footer>
    </div>
  );
}
