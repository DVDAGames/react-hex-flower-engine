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
} from "@mantine/core";
import { Search, Play, Users, Flower2 } from "lucide-react";

import { PageLayout } from "@/components/PageLayout";
import { getGalleryEngines, type Engine } from "@/lib/api";
import type { EngineDefinition } from "@/types/engine";
import classes from "./Garden.module.css";
import { HexIcon } from "../HexIcon";

interface GalleryEngine extends Engine {
  ownerName?: string;
}

export function Garden() {
  const navigate = useNavigate();
  const [engines, setEngines] = useState<GalleryEngine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadEngines = async () => {
      setIsLoading(true);
      const { data, error: apiError } = await getGalleryEngines();

      if (apiError) {
        setError(apiError);
      } else if (data) {
        setEngines(data as GalleryEngine[]);
      }

      setIsLoading(false);
    };

    loadEngines();
  }, []);

  const filteredEngines = engines.filter((engine) => {
    const def = engine.definition as EngineDefinition;
    const query = searchQuery.toLowerCase();
    return (
      def.name.toLowerCase().includes(query) ||
      def.description?.toLowerCase().includes(query) ||
      (engine.ownerName?.toLowerCase().includes(query) ?? false)
    );
  });

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
                return (
                  <Card key={engine.id} withBorder className={classes.engineCard}>
                    <Stack gap="sm">
                      <Group align="center">
                        {def.icon && <HexIcon icon={def.icon} size={24} />}
                        <Text fw={600} size="lg" lineClamp={1}>
                          {def.name}
                        </Text>
                        {engine.useCount > 0 && (
                          <Badge leftSection={<Users size={12} />} variant="light" color="violet">
                            {engine.useCount}
                          </Badge>
                        )}
                      </Group>

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

                      {engine.ownerName && (
                        <Text size="xs" c="dimmed">
                          by {engine.ownerName}
                        </Text>
                      )}

                      <Group gap="xs" mt="auto">
                        <Button
                          variant="light"
                          leftSection={<Play size={16} />}
                          fullWidth
                          onClick={() => navigate(`/?engine=${engine.id}`)}
                        >
                          Run Engine
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
