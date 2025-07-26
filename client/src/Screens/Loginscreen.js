import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Divider, Space, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate(); // Changed from useHistory to useNavigate

 // In your LoginScreen onFinishLogin function
const onFinishLogin = async (values) => {
  try {
    setLoading(true);
    const response = await axios.post('/api/users/login', values);
    
    console.log('Login response:', response.data); // Debug log
    
    if (response.data.success) {
      message.success('Login successful!');
      localStorage.setItem("token", response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      
      // Debug: Check what's being stored
      console.log('Stored user data:', response.data.user);
      console.log('Is admin?', response.data.user.isAdmin);
      
      if (response.data.user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    }
  } catch (error) {
    message.error(error.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};


  const onFinishRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match!');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/users/register', {
        name: values.name,
        email: values.email,
        password: values.password
      });
      
      if (response.data.success) {
        message.success('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const LoginForm = (
    <Form
      name="login"
      onFinish={onFinishLogin}
      autoComplete="off"
      layout="vertical"
      size="large"
    >
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
          placeholder="Enter your email"
        />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter your password"
          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          block
          className="login-btn"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </Form.Item>

      <Divider>
        <Text type="secondary">Or</Text>
      </Divider>

      <Form.Item>
        <Button 
          type="default" 
          block 
          onClick={() => setIsLogin(false)}
          className="switch-btn"
        >
          Create New Account
        </Button>
      </Form.Item>
    </Form>
  );

  const RegisterForm = (
    <Form
      name="register"
      onFinish={onFinishRegister}
      autoComplete="off"
      layout="vertical"
      size="large"
    >
      <Form.Item
        label="Full Name"
        name="name"
        rules={[
          { required: true, message: 'Please input your name!' },
          { min: 2, message: 'Name must be at least 2 characters!' }
        ]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="Enter your full name"
        />
      </Form.Item>

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
          placeholder="Enter your email"
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
          placeholder="Create a password"
          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
      </Form.Item>

      <Form.Item
        label="Confirm Password"
        name="confirmPassword"
        rules={[{ required: true, message: 'Please confirm your password!' }]}
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
        <Button 
          type="default" 
          block 
          onClick={() => setIsLogin(true)}
          className="switch-btn"
        >
          Back to Sign In
        </Button>
      </Form.Item>
    </Form>
  );

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
                  BookMyStay
                </Title>
              </div>
              <Title level={3} className="auth-title">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </Title>
              <Text type="secondary" className="auth-subtitle">
                {isLogin 
                  ? 'Sign in to your account to continue' 
                  : 'Join us for the best hotel booking experience'
                }
              </Text>
            </div>

            <div className="auth-form">
              {isLogin ? LoginForm : RegisterForm}
            </div>

            <div className="auth-footer">
              <Space direction="vertical" align="center" size="small">
                <Text type="secondary">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </Text>
                <Link 
                  to="/forgot-password" 
                  className="forgot-link"
                  style={{ display: isLogin ? 'inline' : 'none' }}
                >
                  Forgot Password?
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
        }
      `}</style>
    </div>
  );
}

export default LoginScreen;

