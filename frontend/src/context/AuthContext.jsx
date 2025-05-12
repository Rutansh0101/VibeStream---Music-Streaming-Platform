import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');

        if (!token) {
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        // Get current user with the token
        const response = await axios.get('http://localhost:4000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setCurrentUser(response.data.user);
        } else {
          // If token is invalid, attempt to refresh
          await refreshToken();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // If token expired, try to refresh
        if (error.response?.data?.tokenExpired) {
          await refreshToken();
        } else {
          // Clear any invalid tokens
          localStorage.removeItem('accessToken');
          setCurrentUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Refresh the token
  const refreshToken = async () => {
    try {
      const response = await axios.post(
        'http://localhost:4000/api/auth/refresh-token',
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);

        // Fetch user data with new token
        const userResponse = await axios.get('http://localhost:4000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${response.data.accessToken}`,
          },
        });

        if (userResponse.data.success) {
          setCurrentUser(userResponse.data.user);
        }
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  };

  // Register a new user
  const register = async (userData) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:4000/api/auth/register',
        userData,
        { withCredentials: true }
      );

      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        setCurrentUser(response.data.user);
        return true;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError(error.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:4000/api/auth/login',
        credentials,
        { withCredentials: true }
      );

      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        setCurrentUser(response.data.user);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        'http://localhost:4000/api/auth/logout',
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API success
      localStorage.removeItem('accessToken');
      setCurrentUser(null);
      setIsLoading(false);
    }
  };

  const authHeader = () => {
  const token = localStorage.getItem('accessToken'); // Use accessToken to match your storage
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
};

  // Update user profile
  const updateProfile = async (userData, profileImage = null) => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      // Append text data
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });

      // Append image if provided
      if (profileImage instanceof File) {
        formData.append('profileImage', profileImage);
      }

      const response = await axios.put(
        'http://localhost:4000/api/user/profile',
        formData,
        {
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response.data.success) {
        // Update current user with new data
        setCurrentUser(prevUser => ({
          ...prevUser,
          ...response.data.data
        }));
        return { success: true };
      }

      return { success: false, error: 'Failed to update profile' };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error updating profile'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        authError,
        register,
        login,
        logout,
        refreshToken,
        authHeader,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};