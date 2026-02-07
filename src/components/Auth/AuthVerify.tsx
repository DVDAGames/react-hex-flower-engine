import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Stack, Title, Text, Loader, Alert, Button } from '@mantine/core';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts';

export function AuthVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyToken } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No verification token provided');
      return;
    }

    verifyToken(token).then(({ error: verifyError }) => {
      if (verifyError) {
        setStatus('error');
        setError(verifyError);
      } else {
        setStatus('success');
        // Redirect to home after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      }
    });
  }, [token, verifyToken, navigate]);

  return (
    <Container size="xs" py="xl">
      <Stack align="center" gap="lg">
        {status === 'loading' && (
          <>
            <Loader size="lg" />
            <Title order={2}>Verifying your sign-in link...</Title>
            <Text c="dimmed">Please wait a moment.</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <Alert
              icon={<CheckCircle size={24} />}
              title="Successfully signed in!"
              color="green"
              w="100%"
            >
              You're now signed in. Redirecting you to the app...
            </Alert>
            <Button onClick={() => navigate('/')} variant="subtle">
              Go to app now
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <Alert
              icon={<AlertCircle size={24} />}
              title="Verification failed"
              color="red"
              w="100%"
            >
              {error || 'Something went wrong. Please try signing in again.'}
            </Alert>
            <Button onClick={() => navigate('/')} variant="light">
              Return to app
            </Button>
          </>
        )}
      </Stack>
    </Container>
  );
}

export default AuthVerify;
