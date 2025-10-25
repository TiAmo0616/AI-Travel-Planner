import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, Tag, Typography, Space } from 'antd';
import {
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  HeartOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Title, Paragraph } = Typography;

const ItineraryCard = ({ markdown }) => (
  <Card
    variant="borderless"
    style={{ maxWidth: 880, margin: '24px auto' }}
  >
    {/* 顶部标签栏 */}
    <Space wrap style={{ marginBottom: 16 }}>
      <Tag icon={<CalendarOutlined />} color="blue">
        {markdown.match(/(\d+)天/)?.[1]} 天
      </Tag>
      <Tag icon={<DollarOutlined />} color="green">
        ¥{markdown.match(/(\d+)元/)?.[1]}
      </Tag>
      <Tag icon={<UserOutlined />} color="purple">
        {markdown.match(/(\d+)人/)?.[1]} 人
      </Tag>
      <Tag icon={<HeartOutlined />} color="red">
        {markdown.match(/偏好：(.*)/)?.[1]?.slice(0, 8) || '自定义'}
      </Tag>
    </Space>

    {/* 正文 Markdown → HTML */}
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => (
          <Title level={2} style={{ color: '#1890ff' }} {...props} />
        ),
        h2: ({ node, ...props }) => (
          <Title level={4} style={{ marginTop: 24 }} {...props} />
        ),
        h3: ({ node, ...props }) => <Title level={5} {...props} />,
        p: ({ node, ...props }) => <Paragraph {...props} />,
        ul: ({ node, ...props }) => (
          <ul style={{ paddingLeft: 20, lineHeight: 1.8 }} {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol style={{ paddingLeft: 20, lineHeight: 1.8 }} {...props} />
        ),
        li: ({ node, ...props }) => (
          <li style={{ marginBottom: 4 }} {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            style={{
              borderLeft: '4px solid #1890ff',
              paddingLeft: 12,
              margin: 0,
              color: '#555',
            }}
            {...props}
          />
        ),
        table: ({ node, ...props }) => (
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              marginTop: 12,
            }}
            {...props}
          />
        ),
        th: ({ node, ...props }) => (
          <th
            style={{
              border: '1px solid #f0f0f0',
              padding: '8px 12px',
              background: '#fafafa',
              fontWeight: 600,
            }}
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td
            style={{ border: '1px solid #f0f0f0', padding: '8px 12px' }}
            {...props}
          />
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  </Card>
);

export default ItineraryCard;