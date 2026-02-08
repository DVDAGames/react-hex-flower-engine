import { useState, useEffect, useCallback } from "react";
import { Modal, Stack, Text, Button, Group, Card, Badge, ActionIcon, Loader, Alert, TextInput, Menu } from "@mantine/core";
import { Trash2, Edit2, Share2, ExternalLink, MoreVertical, Search, Cloud, CloudOff, Globe, Lock, Send } from "lucide-react";
import { useAuth } from "@/contexts";
import { getMyEngines, deleteEngine, updateEngine, createShareLink, type Engine } from "@/lib/api";
import type { EngineDefinition } from "@/types/engine";
import classes from "./MyEnginesModal.module.css";

interface MyEnginesModalProps {
  opened: boolean;
  onClose: () => void;
  onLoadEngine: (engine: EngineDefinition, engineId: string) => void;
}

export function MyEnginesModal({ opened, onClose, onLoadEngine }: MyEnginesModalProps) {
  const { isAuthenticated } = useAuth();
  const [engines, setEngines] = useState<Engine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadEngines = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    const { data, error: apiError } = await getMyEngines();

    if (apiError) {
      setError(apiError);
    } else if (data) {
      setEngines(data);
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (opened && isAuthenticated) {
      loadEngines();
    }
  }, [opened, isAuthenticated, loadEngines]);

  const handleDelete = async (engineId: string) => {
    if (!confirm("Are you sure you want to delete this engine? This cannot be undone.")) {
      return;
    }

    const { error: apiError } = await deleteEngine(engineId);
    if (apiError) {
      setError(apiError);
    } else {
      setEngines((prev) => prev.filter((e) => e.id !== engineId));
    }
  };

  const handleLoad = (engine: Engine) => {
    onLoadEngine(engine.definition as EngineDefinition, engine.id);
    onClose();
  };

  const handleShare = async (engineId: string) => {
    const { data, error: apiError } = await createShareLink(engineId);
    if (apiError) {
      setError(apiError);
    } else if (data) {
      const shareUrl = `${window.location.origin}/s/${data.token}`;
      await navigator.clipboard.writeText(shareUrl);
      alert(`Share link copied to clipboard!\n\n${shareUrl}`);
    }
  };

  const handleSubmitForReview = async (engineId: string) => {
    if (!confirm("Submit this engine for review to be featured in The Garden (public gallery)?")) {
      return;
    }

    const { error: apiError } = await updateEngine(engineId, { visibility: "pending_review" });
    if (apiError) {
      setError(apiError);
    } else {
      loadEngines();
    }
  };

  const filteredEngines = engines.filter((engine) => {
    const def = engine.definition as EngineDefinition;
    return (
      def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "public":
        return (
          <Badge leftSection={<Globe size={12} />} color="green" size="xs">
            Public
          </Badge>
        );
      case "shared":
        return (
          <Badge leftSection={<Share2 size={12} />} color="blue" size="xs">
            Shared
          </Badge>
        );
      case "pending_review":
        return (
          <Badge leftSection={<Send size={12} />} color="yellow" size="xs">
            Pending Review
          </Badge>
        );
      default:
        return (
          <Badge leftSection={<Lock size={12} />} color="gray" size="xs">
            Private
          </Badge>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <Modal opened={opened} onClose={onClose} title="My Engines" size="lg">
        <Alert icon={<CloudOff size={20} />} color="yellow">
          Sign in to save and manage your engines in the cloud.
        </Alert>
      </Modal>
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="My Engines" size="lg">
      <Stack gap="md">
        <TextInput
          placeholder="Search engines..."
          leftSection={<Search size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />

        {error && (
          <Alert color="red" onClose={() => setError(null)} withCloseButton>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Stack align="center" py="xl">
            <Loader />
            <Text size="sm" c="dimmed">
              Loading your engines...
            </Text>
          </Stack>
        ) : filteredEngines.length === 0 ? (
          <Stack align="center" py="xl">
            <Cloud size={48} opacity={0.3} />
            <Text c="dimmed">{searchQuery ? "No engines match your search" : "No saved engines yet"}</Text>
            <Text size="sm" c="dimmed">
              Create an engine in the editor and save it to the cloud.
            </Text>
          </Stack>
        ) : (
          <Stack gap="sm">
            {filteredEngines.map((engine) => {
              const def = engine.definition as EngineDefinition;
              return (
                <Card key={engine.id} withBorder className={classes.engineCard}>
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group gap="xs">
                        <Text fw={600}>{def.name}</Text>
                        {getVisibilityBadge(engine.visibility)}
                      </Group>
                      {def.description && (
                        <Text size="sm" c="dimmed" lineClamp={2}>
                          {def.description}
                        </Text>
                      )}
                      <Text size="xs" c="dimmed">
                        Updated {new Date(engine.updatedAt).toLocaleDateString()}
                        {engine.useCount > 0 && ` • Used ${engine.useCount} times`}
                      </Text>
                    </Stack>

                    <Group gap="xs">
                      <Button size="xs" variant="light" leftSection={<Edit2 size={14} />} onClick={() => handleLoad(engine)}>
                        Edit
                      </Button>

                      <Menu shadow="md" width={200} position="bottom-end">
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <MoreVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item leftSection={<Share2 size={14} />} onClick={() => handleShare(engine.id)}>
                            Copy share link
                          </Menu.Item>

                          <Menu.Item
                            leftSection={<ExternalLink size={14} />}
                            component="a"
                            href={`/?engine=${engine.id}`}
                            target="_blank"
                          >
                            Open in runner
                          </Menu.Item>

                          {engine.visibility === "private" && (
                            <>
                              <Menu.Divider />
                              <Menu.Item leftSection={<Send size={14} />} onClick={() => handleSubmitForReview(engine.id)}>
                                Submit to The Garden
                              </Menu.Item>
                            </>
                          )}

                          <Menu.Divider />

                          <Menu.Item leftSection={<Trash2 size={14} />} color="red" onClick={() => handleDelete(engine.id)}>
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Group>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}

export default MyEnginesModal;
