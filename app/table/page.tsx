"use client";
import { Table, Typography, Tag, Button, Input, Space } from "antd";
import { MailOutlined, SearchOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { FilterConfirmProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import Link from "next/link";
import data from "../data.json";

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

type DataIndex = keyof Application;

const { Title } = Typography;

export default function TablePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<any>(null);

  useEffect(() => {
    try {
      if (data && Array.isArray(data)) {
        setApplications(data);
        console.log("Data loaded successfully:", data.length, "applications");
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
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
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
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
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
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ...getColumnSearchProps('name'),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ...getColumnSearchProps('description'),
      ellipsis: true,
    },
    {
      title: 'Lifecycle',
      dataIndex: 'lifecycle',
      key: 'lifecycle',
      width: 120,
      filters: [
        { text: 'Production', value: 'Production' },
        { text: 'Development', value: 'Development' },
        { text: 'Testing', value: 'Testing' },
      ],
      onFilter: (value, record) => record.lifecycle === value,
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
      dataIndex: 'appsec_release_assessment_required',
      key: 'appsec_release_assessment_required',
      width: 100,
      filters: [
        { text: 'Yes', value: 'Yes' },
        { text: 'No', value: 'No' },
      ],
      onFilter: (value, record) => record.appsec_release_assessment_required === value,
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
        { text: 'Public Facing', value: 'Public Facing' },
        { text: 'Internal', value: 'Internal' },
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
        <Table 
          columns={columns} 
          dataSource={applications}
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
