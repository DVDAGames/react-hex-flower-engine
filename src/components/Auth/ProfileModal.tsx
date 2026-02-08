import { useState, useEffect } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Button,
  Text,
  UnstyledButton,
  Group,
  Alert,
  Avatar,
  Select,
  Loader,
  Badge,
} from "@mantine/core";
import { User } from "lucide-react";
import { useAuth } from "@/contexts";
import { getMyEngines, type Engine } from "@/lib/api";
import { HexIcon } from "@/components/HexIcon";
import { IconPickerModal } from "@/components/Editor/IconPickerModal";
import type { EngineDefinition } from "@/types/engine";
import classes from "./ProfileModal.module.css";

interface ProfileModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ProfileModal({ opened, onClose }: ProfileModalProps) {
  const { user, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [defaultEngineId, setDefaultEngineId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Icon picker modal
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  // User's engines for default engine selection
  const [engines, setEngines] = useState<Engine[]>([]);
  const [enginesLoading, setEnginesLoading] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (opened && user) {
      setDisplayName(user.displayName || "");
      setSelectedIcon(user.avatarUrl || null);
      setDefaultEngineId(user.defaultEngineId || null);
      setError(null);
      setSuccess(false);

      // Load user's engines
      setEnginesLoading(true);
      getMyEngines().then(({ data, error: apiError }) => {
        if (data && !apiError) {
          setEngines(data);
        }
        setEnginesLoading(false);
      });
    }
  }, [opened, user]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const { error: updateError } = await updateUser({
      displayName: displayName.trim(),
      avatarIcon: selectedIcon,
      defaultEngineId: defaultEngineId,
    });

    if (updateError) {
      setError(updateError);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    }

    setIsLoading(false);
  };

  const handleIconSelect = (iconName: string | null) => {
    setSelectedIcon(iconName);
    setIconPickerOpen(false);
  };

  // Build engine options for select
  const engineOptions = engines.map((engine) => {
    const def = engine.definition as EngineDefinition;
    return {
      value: engine.id,
      label: def.name,
    };
  });

  return (
    <>
      <Modal opened={opened} onClose={onClose} title="Edit Profile" size="md">
        <Stack gap="lg">
          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          {success && (
            <Alert color="green" variant="light">
              Profile updated successfully!
            </Alert>
          )}

          {/* Preview */}
          <Group justify="center">
            <Stack align="center" gap="xs">
              <UnstyledButton
                onClick={() => setIconPickerOpen(true)}
                className={classes.avatarButton}
                title="Click to change avatar"
              >
                <Avatar size="xl" color="violet" radius="xl">
                  {selectedIcon ? <HexIcon icon={selectedIcon} size={32} /> : <User size={32} />}
                </Avatar>
                <Badge size="xs" className={classes.editBadge}>
                  Edit
                </Badge>
              </UnstyledButton>
              <Text fw={500}>{displayName || user?.email?.split("@")[0] || "User"}</Text>
              <Text size="xs" c="dimmed">
                {user?.email}
              </Text>
            </Stack>
          </Group>

          {/* Display Name */}
          <TextInput
            label="Display Name"
            description="This is how you'll appear to others"
            placeholder={user?.email?.split("@")[0] || "Enter a display name"}
            value={displayName}
            onChange={(e) => setDisplayName(e.currentTarget.value)}
            maxLength={50}
          />

          {/* Avatar Icon */}
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Avatar Icon
            </Text>
            <Group gap="sm">
              <Avatar size="md" color="violet" radius="xl">
                {selectedIcon ? <HexIcon icon={selectedIcon} size={20} /> : <User size={20} />}
              </Avatar>
              <Button variant="light" size="xs" onClick={() => setIconPickerOpen(true)}>
                {selectedIcon ? "Change Icon" : "Choose Icon"}
              </Button>
              {selectedIcon && (
                <Button variant="subtle" size="xs" color="red" onClick={() => setSelectedIcon(null)}>
                  Clear
                </Button>
              )}
            </Group>
            {selectedIcon && (
              <Text size="xs" c="dimmed">
                Current: {selectedIcon}
              </Text>
            )}
          </Stack>

          {/* Default Engine */}
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Default Engine
            </Text>
            <Text size="xs" c="dimmed">
              This engine will load automatically when you visit the site
            </Text>
            {enginesLoading ? (
              <Group gap="xs">
                <Loader size="xs" />
                <Text size="sm" c="dimmed">
                  Loading your engines...
                </Text>
              </Group>
            ) : engines.length === 0 ? (
              <Text size="sm" c="dimmed">
                No saved engines. Create one in the Editor to set as default.
              </Text>
            ) : (
              <Select
                placeholder="Use built-in engine"
                data={engineOptions}
                value={defaultEngineId}
                onChange={setDefaultEngineId}
                clearable
                searchable
              />
            )}
          </Stack>

          {/* Actions */}
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={isLoading}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      <IconPickerModal
        opened={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={handleIconSelect}
        currentIcon={selectedIcon}
      />
    </>
  );
}

export default ProfileModal;
