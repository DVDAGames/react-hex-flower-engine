import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Stack,
  Group,
  Card,
  Badge,
  Button,
  Loader,
  Alert,
  TextInput,
  SimpleGrid,
  Anchor,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { Search, Play, Users, Flower2, BookmarkPlus, Hexagon, Pencil } from "lucide-react";

import { PageLayout } from "@/components/PageLayout";
import { getGalleryEngines, forkEngine, getMyEngines, type Engine } from "@/lib/api";
import type { EngineDefinition } from "@/types/engine";
import classes from "./Garden.module.css";
import { HexIcon } from "../HexIcon";
import { useAuth } from "@/contexts";

interface GalleryEngine extends Engine {
  ownerName?: string;
  ownerIcon?: string;
}

export function Garden() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [engines, setEngines] = useState<GalleryEngine[]>([]);
  const [myEngineIds, setMyEngineIds] = useState<Set<string>>(new Set());
  const [forkedEngineIds, setForkedEngineIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [savingEngineId, setSavingEngineId] = useState<string | null>(null);

  useEffect(() => {
    const loadEngines = async () => {
      setIsLoading(true);
      const { data, error: apiError } = await getGalleryEngines();

      if (apiError) {
        setError(apiError);
      } else if (data) {
        setEngines(data as GalleryEngine[]);
      }

      // Load user's engines to check for duplicates/forks
      if (isAuthenticated) {
        const { data: myEngines } = await getMyEngines();
        if (myEngines) {
          const ids = new Set(myEngines.map((e) => e.id));
          const forkedIds = new Set(myEngines.filter((e) => e.forkedFrom).map((e) => e.forkedFrom as string));
          setMyEngineIds(ids);
          setForkedEngineIds(forkedIds);
        }
      }

      setIsLoading(false);
    };

    loadEngines();
  }, [isAuthenticated]);

  const filteredEngines = engines.filter((engine) => {
    const def = engine.definition as EngineDefinition;
    const query = searchQuery.toLowerCase();
    return (
      def.name.toLowerCase().includes(query) ||
      def.description?.toLowerCase().includes(query) ||
      (engine.ownerName?.toLowerCase().includes(query) ?? false)
    );
  });

  const handleSaveEngine = async (engineId: string) => {
    if (!isAuthenticated) {
      setError("Please sign in to save engines to your collection");
      return;
    }

    setSavingEngineId(engineId);
    const { data, error: apiError } = await forkEngine(engineId);

    if (apiError) {
      setError(apiError);
    } else if (data) {
      // Update the forked engine IDs set
      setForkedEngineIds((prev) => new Set([...prev, engineId]));
      setMyEngineIds((prev) => new Set([...prev, data.id]));

      // Clear any previous errors
      setError(null);

      // Could add a success notification here
      const engineDef = engines.find((e) => e.id === engineId)?.definition as EngineDefinition;
      alert(`"${engineDef?.name}" saved to your collection!`);
    }

    setSavingEngineId(null);
  };

  return (
    <PageLayout>
      <Container size="lg" py="xl" w="100%">
        <Stack gap="xl">
          {/* Header */}
          <Stack gap={4}>
            <Group gap="xs">
              <Flower2 size={32} />
              <Title order={1}>The Garden</Title>
            </Group>
            <Text c="dimmed" size="lg">
              A collection of community-created Hex Flower Engines
            </Text>
          </Stack>

          {/* Search */}
          <TextInput
            placeholder="Search engines by name, description, or creator..."
            leftSection={<Search size={18} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            size="md"
          />

          {/* Content */}
          {error && (
            <Alert color="red" onClose={() => setError(null)} withCloseButton>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Stack align="center" py="xl">
              <Loader size="lg" />
              <Text c="dimmed">Loading engines from The Garden...</Text>
            </Stack>
          ) : filteredEngines.length === 0 ? (
            <Stack align="center" py="xl">
              <Flower2 size={64} opacity={0.3} />
              <Text c="dimmed" size="lg">
                {searchQuery ? "No engines match your search" : "The Garden is empty"}
              </Text>
              <Text c="dimmed" size="sm">
                Be the first to share your engine with the community!
              </Text>
              <Button variant="light" onClick={() => navigate("/editor")}>
                Create an Engine
              </Button>
            </Stack>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {filteredEngines.map((engine) => {
                const def = engine.definition as EngineDefinition;
                const isSystemEngine = engine.isSystemDefault;
                const alreadySaved = myEngineIds.has(engine.id) || forkedEngineIds.has(engine.id);

                return (
                  <Card key={engine.id} withBorder className={classes.engineCard}>
                    <Stack gap="sm" h="100%">
                      <Group align="center">
                        {isSystemEngine ? (
                          <Hexagon size={24} fill="currentColor" opacity={0.7} />
                        ) : def.icon ? (
                          <HexIcon icon={def.icon} size={24} />
                        ) : null}
                        <Tooltip label={def.name}>
                          <Text fw={600} size="lg" lineClamp={1} maw="50%" truncate>
                            {def.name}
                          </Text>
                        </Tooltip>
                        {isSystemEngine && (
                          <Badge variant="light" color="blue" size="xs">
                            Official
                          </Badge>
                        )}
                        {engine.useCount > 0 && (
                          <Badge leftSection={<Users size={12} />} variant="light" color="violet">
                            {engine.useCount}
                          </Badge>
                        )}
                        {isAuthenticated && ((user?.isAdmin && engine.isSystemDefault) || engine.ownerId === user?.id) ? (
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => navigate(`/editor/${engine.id}`)}
                            aria-label="Edit engine"
                            ml="auto"
                          >
                            <Pencil size={12} />
                          </ActionIcon>
                        ) : null}
                      </Group>

                      {engine.ownerName && (
                        <Group gap={4}>
                          {isSystemEngine ? (
                            <Hexagon size={12} opacity={0.5} />
                          ) : engine?.ownerIcon ? (
                            <HexIcon icon={engine.ownerIcon} size={12} />
                          ) : (
                            <HexIcon size={12} icon="hexagons7" />
                          )}
                          <Text size="xs" c="dimmed">
                            {engine.ownerName}
                          </Text>
                        </Group>
                      )}

                      {def.description && (
                        <Text size="sm" c="dimmed" lineClamp={3}>
                          {def.description}
                        </Text>
                      )}

                      <Group gap="xs">
                        <Badge variant="outline" size="sm">
                          {def.roll}
                        </Badge>
                      </Group>

                      <Group gap="xs" mt="auto">
                        <Tooltip
                          label={
                            !isAuthenticated
                              ? "Sign in to save engines"
                              : alreadySaved
                                ? "Already in your collection"
                                : "Save to My Engines"
                          }
                        >
                          <Button
                            variant="outline"
                            leftSection={<BookmarkPlus size={16} />}
                            onClick={() => handleSaveEngine(engine.id)}
                            disabled={!isAuthenticated || alreadySaved}
                            loading={savingEngineId === engine.id}
                            style={{ flex: 1 }}
                          >
                            Save
                          </Button>
                        </Tooltip>
                        <Button
                          variant="light"
                          leftSection={<Play size={16} />}
                          onClick={() => navigate(`/?engine=${engine.id}`)}
                          style={{ flex: 1 }}
                        >
                          Run
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}

          {/* Footer CTA */}
          <Stack align="center" gap="xs" py="xl">
            <Text size="sm" c="dimmed">
              Want to share your engine here?
            </Text>
            <Text size="sm" c="dimmed">
              <Anchor onClick={() => navigate("/editor")}>Create an engine</Anchor>, then submit it for review to appear in The
              Garden.
            </Text>
          </Stack>
        </Stack>
      </Container>
    </PageLayout>
  );
}

export default Garden;
