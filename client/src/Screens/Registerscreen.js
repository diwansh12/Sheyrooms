import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Divider, Space, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

function Registerscreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

const handleNavigationToLogin = () => {
  console.log('Attempting to navigate to login...');

  try {
    navigate('/login', { replace: true });
    console.log('Navigation successful');
  } catch (navError) {
    console.error('React Router navigation failed:', navError);
  }
};
    
 const onFinish = async (values) => {
  if (values.password !== values.confirmpassword) {
    return message.error('Passwords do not match');
  }
  
  try {
    setLoading(true);
    
    const userData = {
      name: {
        first: values.firstName,
        last: values.lastName
      },
      email: values.email,
      password: values.password
    };
    
    console.log('Attempting registration with:', userData);
    
    const response = await axios.post('/api/users/register', userData);
    
    console.log('Full registration response:', response);
    console.log('Response data:', response.data);
    console.log('Response status:', response.status);
    
    // Check for successful response in multiple ways
    if (response.status === 200 || response.status === 201 || 
        response.data?.success === true || 
        response.data?.message?.includes('success') ||
        response.data?.user) {
      
      message.success('Registration successful! Redirecting to login...');
      
      setTimeout(handleNavigationToLogin, 1500);
    } else {
      console.log('Registration seemed successful but unexpected response format');
      message.error('Registration completed but please try logging in manually.');
      
      // Still redirect even if response format is unexpected
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    }
  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.response) {
      console.log('Error response status:', err.response.status);
      console.log('Error response data:', err.response.data);
      
      // Sometimes registration succeeds but returns error status
      if (err.response.status === 400 && err.response.data?.message?.includes('already exists')) {
        message.error('User already exists. Please try logging in.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      } else {
        const errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        message.error(errorMessage);
      }
    } else if (err.request) {
      message.error('Unable to connect to server. Please check your connection.');
    } else {
      message.error('An unexpected error occurred. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-card-wrapper">
          <Card 
            className="auth-card"
            bordered={false}
          >
            <div className="auth-header">
              <div className="logo-section">
                <div className="logo-icon">🏨</div>
                <Title level={2} className="brand-title">
                  SheyRooms
                </Title>
              </div>
              <Title level={3} className="auth-title">
                Create Your Account
              </Title>
              <Text type="secondary" className="auth-subtitle">
                Join us for the best hotel booking experience
              </Text>
            </div>

            <div className="auth-form">
              <Form
                name="register"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                size="large"
              >
                {/* Name Fields in Row */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    style={{ flex: 1 }}
                    rules={[
                      { required: true, message: 'Please input your first name!' },
                      { min: 2, message: 'First name must be at least 2 characters!' }
                    ]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="John"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    style={{ flex: 1 }}
                    rules={[
                      { required: true, message: 'Please input your last name!' },
                      { min: 2, message: 'Last name must be at least 2 characters!' }
                    ]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="Doe"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="name@example.com"
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: 'Please input your password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Create a strong password"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item
                  label="Confirm Password"
                  name="confirmpassword"
                  rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm your password"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    block
                    className="register-btn"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Form.Item>

                <Divider>
                  <Text type="secondary">Or</Text>
                </Divider>

                <Form.Item>
                  <Link to="/login">
                    <Button 
                      type="default" 
                      block 
                      className="switch-btn"
                    >
                      Back to Sign In
                    </Button>
                  </Link>
                </Form.Item>
              </Form>
            </div>

            <div className="auth-footer">
              <Space direction="vertical" align="center" size="small">
                <Text type="secondary">
                  Already have an account?
                </Text>
                <Link to="/login" className="forgot-link">
                  Sign In Here
                </Link>
              </Space>
            </div>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .auth-background {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .auth-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }

        .auth-card-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 450px;
        }

        .auth-card {
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-section {
          margin-bottom: 24px;
        }

        .logo-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .brand-title {
          color: #1890ff;
          margin-bottom: 8px !important;
          font-weight: 700;
        }

        .auth-title {
          color: #262626;
          margin-bottom: 8px !important;
          font-weight: 600;
        }

        .auth-subtitle {
          font-size: 16px;
          color: #8c8c8c;
        }

        .auth-form {
          margin-bottom: 24px;
        }

        .auth-footer {
          text-align: center;
        }

        .forgot-link {
          color: #1890ff;
          text-decoration: none;
          font-weight: 500;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        :global(.login-btn) {
          background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
          border: none;
          height: 48px;
          font-weight: 600;
          font-size: 16px;
          border-radius: 8px;
        }

        :global(.register-btn) {
          background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
          border: none;
          height: 48px;
          font-weight: 600;
          font-size: 16px;
          border-radius: 8px;
        }

        :global(.switch-btn) {
          height: 48px;
          font-weight: 500;
          border-radius: 8px;
          color: #595959;
          border-color: #d9d9d9;
        }

        :global(.switch-btn:hover) {
          color: #1890ff;
          border-color: #1890ff;
        }

        :global(.ant-input-affix-wrapper) {
          height: 48px;
          border-radius: 8px;
          border-color: #e8e8e8;
        }

        :global(.ant-input-affix-wrapper:focus),
        :global(.ant-input-affix-wrapper-focused) {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }

        :global(.ant-form-item-label > label) {
          font-weight: 600;
          color: #262626;
        }

        :global(.ant-divider-horizontal.ant-divider-with-text::before),
        :global(.ant-divider-horizontal.ant-divider-with-text::after) {
          border-top-color: #f0f0f0;
        }

        @media (max-width: 576px) {
          .auth-card {
            padding: 24px;
            margin: 0 16px;
          }
          
          .auth-background {
            padding: 0;
          }

          .auth-card-wrapper {
            max-width: 100%;
          }

          /* Stack name fields on mobile */
          .auth-form div[style*="display: flex"] {
            flex-direction: column !important;
            gap: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Registerscreen;

