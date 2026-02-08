import { useState } from "react";
import { Modal, TextInput, Button, Stack, Text, Alert, Title } from "@mantine/core";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts";

interface LoginModalProps {
  opened: boolean;
  onClose: () => void;
}

export function LoginModal({ opened, onClose }: LoginModalProps) {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: authError } = await signInWithMagicLink(email);

    setIsLoading(false);

    if (authError) {
      setError(authError);
    } else {
      setSuccess(true);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={<Title order={3}>Sign in to Hex Flower Engine</Title>} centered size="sm">
      {success ? (
        <Stack gap="md">
          <Alert icon={<CheckCircle size={20} />} title="Check your email" color="green">
            We sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.
          </Alert>
          <Text size="sm" c="dimmed" ta="center">
            The link expires in 15 minutes.
          </Text>
          <Button variant="subtle" onClick={handleClose}>
            Close
          </Button>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Enter your email address and we'll send you a magic link to sign in. No password required.
            </Text>

            {error && (
              <Alert icon={<AlertCircle size={20} />} title="Error" color="red">
                {error}
              </Alert>
            )}

            <TextInput
              label="Email address"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              leftSection={<Mail size={16} />}
              disabled={isLoading}
            />

            <Button type="submit" loading={isLoading} fullWidth>
              Send magic link
            </Button>
          </Stack>
        </form>
      )}
    </Modal>
  );
}

export default LoginModal;
