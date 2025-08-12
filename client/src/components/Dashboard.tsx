import { Box } from './Box';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, selectUser } from '@/store/slices/authSlice';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

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
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>
              Welcome back, {user?.username}!
            </h1>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '16px' }}>
              Manage your properties and bookings
            </p>
          </Box>
          
          <button
            onClick={() => dispatch(logout())}
            style={{
              backgroundColor: 'transparent',
              color: '#007bff',
              border: '1px solid #007bff',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
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
          </button>
        </Box>

        <Box display="grid" gridTemplateColumns="1fr" gridTemplateColumnsMd="1fr 1fr" gap={24}>
          <Box
            backgroundColor="white"
            borderRadius={8}
            padding={24}
            boxShadow="0 2px 4px rgba(0,0,0,0.1)"
          >
            <Box display="flex" flexDirection="column" gap={16}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Account Information</h2>
              
              <Box display="flex" flexDirection="column" gap={8}>
                <Box>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#6c757d', marginBottom: '2px' }}>Username</div>
                  <div style={{ fontSize: '16px' }}>{user?.username}</div>
                </Box>
                
                <Box>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#6c757d', marginBottom: '2px' }}>Email</div>
                  <div style={{ fontSize: '16px' }}>{user?.email}</div>
                </Box>
                
                <Box>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#6c757d', marginBottom: '2px' }}>Role</div>
                  <div style={{ fontSize: '16px', textTransform: 'capitalize' }}>
                    {user?.role?.toLowerCase() || 'Tenant'}
                  </div>
                </Box>
                
                <Box>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#6c757d', marginBottom: '2px' }}>Member Since</div>
                  <div style={{ fontSize: '16px' }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </Box>
              </Box>

              <Box paddingTop={16}>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    border: '1px solid #007bff',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Edit Profile
                </button>
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
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Quick Actions</h2>
              
              <Box display="flex" flexDirection="column" gap={12}>
                <button
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  List a Property
                </button>
                
                <button
                  style={{
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    border: '1px solid #007bff',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  View My Properties
                </button>
                
                <button
                  style={{
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    border: '1px solid #007bff',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Booking History
                </button>
                
                <button
                  style={{
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    border: '1px solid #007bff',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Messages
                </button>
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
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Recent Activity</h2>
              
              <Box
                padding={32}
                textAlign="center"
                backgroundColor="#f8f9fa"
                borderRadius={8}
                border="2px dashed #dee2e6"
              >
                <div style={{ color: '#6c757d', fontSize: '16px', marginBottom: '8px' }}>
                  No recent activity
                </div>
                <div style={{ color: '#6c757d', fontSize: '14px' }}>
                  Your recent bookings and property updates will appear here
                </div>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box marginTop={32} textAlign="center">
          <p style={{ fontSize: '14px', color: '#6c757d', margin: 0 }}>
            Need help? Contact our support team or visit our help center.
          </p>
        </Box>
      </Box>
    </Box>
  );
};