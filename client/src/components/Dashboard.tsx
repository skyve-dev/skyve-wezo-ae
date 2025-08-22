import { Box } from './base/Box';
import { Button } from './base/Button';
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
          
          <Button
            label="Sign Out"
            onClick={() => dispatch(logout())}
            variant="normal"
            size="medium"
            style={{
              color: '#007bff',
              border: '1px solid #007bff',
              padding: '0.5rem 1rem'
            }}
          />
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
                <Button
                  label="Edit Profile"
                  onClick={() => {}}
                  variant="normal"
                  size="small"
                  style={{
                    color: '#007bff',
                    border: '1px solid #007bff',
                    padding: '0.5rem 0.75rem'
                  }}
                />
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
                <Button
                  label="List a Property"
                  onClick={() => redirectToPropertyRegistration(navigate)}
                  variant="promoted"
                  size="medium"
                  fullWidth
                  style={{
                    padding: '0.75rem 1rem'
                  }}
                />
                
                <Button
                  label="View My Properties"
                  onClick={() => navigate({ to: '/dashboard/my-properties' })}
                  variant="normal"
                  size="medium"
                  fullWidth
                  style={{
                    color: '#007bff',
                    border: '1px solid #007bff',
                    padding: '0.75rem 1rem'
                  }}
                />
                
                <Button
                  label="Manage Photos"
                  onClick={() => navigate({ to: '/dashboard/photos' })}
                  variant="normal"
                  size="medium"
                  fullWidth
                  style={{
                    color: '#007bff',
                    border: '1px solid #007bff',
                    padding: '0.75rem 1rem'
                  }}
                />
                
                <Button
                  label="Booking History"
                  onClick={() => {}}
                  variant="normal"
                  size="medium"
                  fullWidth
                  style={{
                    color: '#007bff',
                    border: '1px solid #007bff',
                    padding: '0.75rem 1rem'
                  }}
                />
                
                <Button
                  label="Messages"
                  onClick={() => {}}
                  variant="normal"
                  size="medium"
                  fullWidth
                  style={{
                    color: '#007bff',
                    border: '1px solid #007bff',
                    padding: '0.75rem 1rem'
                  }}
                />

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