import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

const AuthLayout: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container>
        <Outlet />
      </Container>
    </Box>
  );
};

export default AuthLayout;