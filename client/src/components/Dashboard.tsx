import { Box } from './base/Box';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout, selectUser } from '@/store/slices/authSlice';
import { useNavigate } from '@tanstack/react-router';
import { redirectToPropertyRegistration } from '../utils/deviceDetection';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();

  return (
    <Box
      width="100%"
      minHeight="100vh"
      backgroundColor="#f8f9fa"
      padding={20}
      paddingMd={40}
    >
      <Box maxWidth={800} margin="0 auto">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          marginBottom={32}
          flexWrap="wrap"
          gap={16}
        >
          <Box>
            <Box as="h1" margin={0} fontSize={32} fontWeight={700} marginBottom={4}>
              Welcome back, {user?.username}!
            </Box>
            <Box as="p" margin={0} color="#6c757d" fontSize={16}>
              Manage your properties and bookings
            </Box>
          </Box>
          
          <Box as="button"
            onClick={() => dispatch(logout())}
            style={{
              backgroundColor: 'transparent',
              color: '#007bff',
              border: '1px solid #007bff',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#007bff';
            }}
          >
            Sign Out
          </Box>
        </Box>

        <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsMd="1fr 1fr" gap={24}>
          <Box
            backgroundColor="white"
            borderRadius={8}
            padding={24}
            boxShadow="0 2px 4px rgba(0,0,0,0.1)"
          >
            <Box display="flex" flexDirection="column" gap={16}>
              <Box as="h2" margin={0} fontSize={20} fontWeight={600}>Account Information</Box>
              
              <Box display="flex" flexDirection="column" gap={8}>
                <Box>
                  <Box fontSize={16} fontWeight={500} color="#6c757d" marginBottom={2}>Username</Box>
                  <Box fontSize={16}>{user?.username}</Box>
                </Box>
                
                <Box>
                  <Box fontSize={16} fontWeight={500} color="#6c757d" marginBottom={2}>Email</Box>
                  <Box fontSize={16}>{user?.email}</Box>
                </Box>
                
                <Box>
                  <Box fontSize={16} fontWeight={500} color="#6c757d" marginBottom={2}>Role</Box>
                  <Box fontSize={16} textTransform="capitalize">
                    {user?.role?.toLowerCase() || 'Tenant'}
                  </Box>
                </Box>
                
                <Box>
                  <Box fontSize={16} fontWeight={500} color="#6c757d" marginBottom={2}>Member Since</Box>
                  <Box fontSize={16}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </Box>
                </Box>
              </Box>

              <Box paddingTop={16}>
                <Box as="button"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    border: '1px solid #007bff',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Edit Profile
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            backgroundColor="white"
            borderRadius={8}
            padding={24}
            boxShadow="0 2px 4px rgba(0,0,0,0.1)"
          >
            <Box display="flex" flexDirection="column" gap={16}>
              <Box as="h2" margin={0} fontSize={20} fontWeight={600}>Quick Actions</Box>
              
              <Box display="flex" flexDirection="column" gap={12}>
                <Box as="button"
                  onClick={() => redirectToPropertyRegistration(navigate)}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  List a Property
                </Box>
                
                <Box as="button"
                  onClick={() => navigate({ to: '/dashboard/my-properties' })}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    border: '1px solid #007bff',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  View My Properties
                </Box>
                
                <Box as="button"
                  onClick={() => navigate({ to: '/dashboard/photos' })}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    border: '1px solid #007bff',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Manage Photos
                </Box>
                
                <Box as="button"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    border: '1px solid #007bff',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Booking History
                </Box>
                
                <Box as="button"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    border: '1px solid #007bff',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Messages
                </Box>

              </Box>
            </Box>
          </Box>

          <Box
            backgroundColor="white"
            borderRadius={8}
            padding={24}
            boxShadow="0 2px 4px rgba(0,0,0,0.1)"
            gridColumn="1 / -1"
          >
            <Box display="flex" flexDirection="column" gap={16}>
              <Box as="h2" margin={0} fontSize={20} fontWeight={600}>Recent Activity</Box>
              
              <Box
                padding={32}
                textAlign="center"
                backgroundColor="#f8f9fa"
                borderRadius={8}
                border="2px dashed #dee2e6"
              >
                <Box color="#6c757d" fontSize={16} marginBottom={8}>
                  No recent activity
                </Box>
                <Box color="#6c757d" fontSize={16}>
                  Your recent bookings and property updates will appear here
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box marginTop={32} textAlign="center">
          <Box as="p" fontSize={16} color="#6c757d" margin={0}>
            Need help? Contact our support team or visit our help center.
          </Box>
        </Box>
      </Box>
    </Box>
  );
};