import { useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Button,
  Alert,
  Group,
} from '@mantine/core';
import { Cloud, CloudOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts';
import { createEngine, updateEngine } from '@/lib/api';
import type { EngineDefinition } from '@/types/engine';

interface SaveEngineModalProps {
  opened: boolean;
  onClose: () => void;
  engine: EngineDefinition;
  existingEngineId: string | null;
  onSaveSuccess: (engineId: string) => void;
}

export function SaveEngineModal({
  opened,
  onClose,
  engine,
  existingEngineId,
  onSaveSuccess,
}: SaveEngineModalProps) {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    if (existingEngineId) {
      // Update existing engine
      const { data, error: apiError } = await updateEngine(existingEngineId, {
        definition: engine,
      });

      if (apiError) {
        setError(apiError);
      } else if (data) {
        setSuccess(true);
        onSaveSuccess(data.id);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } else {
      // Create new engine
      const { data, error: apiError } = await createEngine(engine);

      if (apiError) {
        setError(apiError);
      } else if (data) {
        setSuccess(true);
        onSaveSuccess(data.id);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isAuthenticated) {
    return (
      <Modal opened={opened} onClose={handleClose} title="Save to Cloud" size="sm">
        <Stack gap="md">
          <Alert icon={<CloudOff size={20} />} color="yellow">
            Sign in to save your engines to the cloud.
          </Alert>
          <Text size="sm" c="dimmed">
            Cloud saving allows you to access your engines from any device and share them with others.
          </Text>
          <Button variant="subtle" onClick={handleClose}>
            Close
          </Button>
        </Stack>
      </Modal>
    );
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Save to Cloud" size="sm">
      <Stack gap="md">
        {success ? (
          <Alert icon={<CheckCircle size={20} />} color="green">
            Engine saved successfully!
          </Alert>
        ) : (
          <>
            <Stack gap="xs">
              <Text size="sm">
                <strong>Engine:</strong> {engine.name}
              </Text>
              <Text size="sm">
                <strong>Saving as:</strong> {user?.displayName || user?.email}
              </Text>
              <Text size="sm" c="dimmed">
                {existingEngineId 
                  ? 'This will update your existing saved engine.' 
                  : 'This will create a new engine in your cloud storage.'}
              </Text>
            </Stack>

            {error && (
              <Alert icon={<AlertCircle size={20} />} color="red">
                {error}
              </Alert>
            )}

            <Group justify="flex-end" gap="sm">
              <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                leftSection={<Cloud size={16} />}
                onClick={handleSave}
                loading={isLoading}
              >
                {existingEngineId ? 'Update' : 'Save'}
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}

export default SaveEngineModal;
