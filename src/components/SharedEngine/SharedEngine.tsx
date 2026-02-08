import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Stack, Title, Text, Loader, Alert, Button, Group, Paper, Badge, List, Transition } from "@mantine/core";
import { ArrowLeft, AlertCircle, Share2 } from "lucide-react";
import { getSharedEngine } from "@/lib/api";
import { Grid } from "@/components/Grid";
import { Toolbar } from "@/components/Toolbar";
import { PageLayout } from "@/components/PageLayout";
import type { EngineDefinition, HexNode } from "@/types/engine";
import { ROLL_DELAY, ACTIONS, type ActionType } from "@/constants";
import classes from "./SharedEngine.module.css";

interface RollResult {
  type: ActionType;
  total: number;
}

export function SharedEngine() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [engine, setEngine] = useState<EngineDefinition | null>(null);
  const [activeHex, setActiveHex] = useState<number | null>(null);
  const [activeHexInfo, setActiveHexInfo] = useState<HexNode | null>(null);
  const [roll, setRoll] = useState<RollResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to track current activeHex without causing effect re-runs
  const activeHexRef = useRef<number | null>(null);
  activeHexRef.current = activeHex;

  // Load shared engine
  useEffect(() => {
    if (!token) {
      setError("Invalid share link");
      setIsLoading(false);
      return;
    }

    const loadEngine = async () => {
      setIsLoading(true);
      const { data, error: apiError } = await getSharedEngine(token);

      if (apiError) {
        setError(apiError);
      } else if (data) {
        const engineDef = data.engine.definition as EngineDefinition;
        setEngine(engineDef);
        setActiveHex(data.activeHex ?? engineDef.start);
      }

      setIsLoading(false);
    };

    loadEngine();
  }, [token]);

  // Update active hex info when hex changes
  useEffect(() => {
    if (engine && activeHex !== null) {
      const hexInfo = engine.nodes.find(({ id }) => id === activeHex);
      setActiveHexInfo(hexInfo ?? null);
    }
  }, [engine, activeHex]);

  // Handle roll results
  useEffect(() => {
    if (!roll || !engine) return;

    const currentActiveHex = activeHexRef.current;
    if (currentActiveHex === null) return;

    const handleRoll = () => {
      switch (roll.type) {
        case ACTIONS.RANDOM:
          setActiveHex(roll.total);
          break;

        case ACTIONS.RUN:
        default: {
          const direction = engine.directions[roll.total];
          const currentNode = engine.nodes.find(({ id }) => id === currentActiveHex);

          if (direction === "stay") {
            break;
          }

          if (direction && currentNode) {
            const newNodeId = currentNode.map[direction];
            if (newNodeId) {
              setActiveHex(newNodeId);
            }
          }
          break;
        }
      }
    };

    handleRoll();

    const timeout = setTimeout(() => {
      setRoll(null);
    }, ROLL_DELAY);

    return () => clearTimeout(timeout);
  }, [roll, engine]);

  const handleCopyLink = useCallback(async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  }, []);

  if (isLoading) {
    return (
      <PageLayout>
        <Container size="sm" py="xl">
          <Stack align="center" gap="lg">
            <Loader size="xl" />
            <Text c="dimmed">Loading shared engine...</Text>
          </Stack>
        </Container>
      </PageLayout>
    );
  }

  if (error || !engine) {
    return (
      <PageLayout>
        <Container size="sm" py="xl">
          <Stack gap="lg">
            <Alert icon={<AlertCircle size={24} />} color="red" title="Error">
              {error || "Failed to load shared engine"}
            </Alert>
            <Button variant="light" leftSection={<ArrowLeft size={16} />} onClick={() => navigate("/")}>
              Go to Home
            </Button>
          </Stack>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className={classes.container}>
        {/* Header */}
        <Paper className={classes.header} withBorder>
          <Group justify="space-between" px="md" py="sm">
            <Group gap="xs">
              <Badge variant="light" color="violet" leftSection={<Share2 size={12} />}>
                Shared Engine
              </Badge>
              <Text fw={600}>{engine.name}</Text>
            </Group>
            <Group gap="xs">
              <Button variant="subtle" size="xs" onClick={handleCopyLink}>
                Copy Link
              </Button>
              <Button variant="subtle" size="xs" leftSection={<ArrowLeft size={14} />} onClick={() => navigate("/")}>
                Home
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* Toolbar */}
        <Toolbar currentEngine={engine} setActiveHex={setActiveHex} setRoll={setRoll} onAction={() => {}} />

        {/* Main content */}
        <div className={classes.main}>
          <Grid engine={engine} activeHex={activeHex ?? engine.start} setActiveHex={setActiveHex} />

          {/* Hex info panel */}
          <Transition mounted={!!activeHexInfo} transition="slide-up">
            {(styles) => (
              <Paper className={classes.infoPanel} withBorder shadow="md" p="md" style={styles}>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Title order={4}>{activeHexInfo?.label || `Hex ${activeHex}`}</Title>
                    <Badge>Hex {activeHex}</Badge>
                  </Group>
                  {activeHexInfo?.description && (
                    <Text size="sm" c="dimmed">
                      {activeHexInfo.description}
                    </Text>
                  )}
                  {activeHexInfo?.modifiers && activeHexInfo.modifiers.length > 0 && (
                    <List size="sm" spacing="xs">
                      {activeHexInfo.modifiers.map((mod, i) => (
                        <List.Item key={i}>
                          <strong>{mod.key}:</strong> {mod.value}
                        </List.Item>
                      ))}
                    </List>
                  )}
                </Stack>
              </Paper>
            )}
          </Transition>
        </div>
      </div>
    </PageLayout>
  );
}

export default SharedEngine;
