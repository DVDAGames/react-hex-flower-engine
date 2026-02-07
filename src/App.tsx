import { useState, useEffect, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { AppShell, Container, Title, Text, Stack, Paper, Badge, List, Transition } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { Grid } from "@/components/Grid";
import { Toolbar } from "@/components/Toolbar";
import type { EngineDefinition, HexNode } from "@/types/engine";
import { BUILTIN_ENGINES, ROLL_DELAY, ACTIONS, type ActionType } from "@/constants";
import {
  getCurrentEngineId,
  setCurrentEngineId,
  getEngineState,
  setEngineState,
  getPreferences,
  setPreferences,
  setupSyncListeners,
  isOnline,
} from "@/services";

import classes from "./App.module.css";

interface RollResult {
  type: ActionType;
  total: number;
}

function HexFlowerRunner() {
  const [currentEngine, setCurrentEngine] = useState<EngineDefinition | null>(null);
  const [activeHex, setActiveHex] = useState<number | null>(null);
  const [activeHexInfo, setActiveHexInfo] = useState<HexNode | null>(null);
  const [roll, setRoll] = useState<RollResult | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [engines] = useState<EngineDefinition[]>(BUILTIN_ENGINES);
  const [online, setOnline] = useState(isOnline());

  // DEBUG - remove after fixing
  console.log("HexFlowerRunner render, engines:", engines.length, "currentEngine:", currentEngine?.name);

  // Initialize from localStorage
  useEffect(() => {
    const savedEngineId = getCurrentEngineId();
    const prefs = getPreferences();
    setShowAnnotations(prefs.showAnnotations);

    // Try to find saved engine, fall back to first engine if not found
    let engine = savedEngineId ? engines.find((e) => e.name === savedEngineId) : null;

    // If saved engine not found (e.g., old localStorage data), use first engine
    if (!engine && engines.length > 0) {
      engine = engines[0];
    }

    if (engine) {
      setCurrentEngine(engine);
    }
  }, [engines]);

  // Load engine state when engine changes
  useEffect(() => {
    if (currentEngine) {
      setCurrentEngineId(currentEngine.name);
      const savedState = getEngineState(currentEngine.name);

      if (savedState) {
        setActiveHex(savedState.activeHex);
      } else {
        setActiveHex(currentEngine.start);
      }
    }
  }, [currentEngine]);

  // Update active hex info when hex changes
  useEffect(() => {
    if (currentEngine && activeHex !== null) {
      const hexInfo = currentEngine.nodes.find(({ id }) => id === activeHex);
      setActiveHexInfo(hexInfo ?? null);

      // Save state
      setEngineState(currentEngine.name, {
        activeHex,
        lastUpdated: Date.now(),
      });
    }
  }, [currentEngine, activeHex]);

  // Handle roll results
  useEffect(() => {
    if (!roll || !currentEngine || activeHex === null) return;

    const handleRoll = () => {
      switch (roll.type) {
        case ACTIONS.RANDOM:
          setActiveHex(roll.total);
          break;

        case ACTIONS.RUN:
        default: {
          const direction = currentEngine.directions[roll.total];
          const currentNode = currentEngine.nodes.find(({ id }) => id === activeHex);

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

    // Clear roll display after delay
    const timeout = setTimeout(() => {
      setRoll(null);
    }, ROLL_DELAY);

    return () => clearTimeout(timeout);
  }, [roll, currentEngine, activeHex]);

  // Save annotation preference
  const handleSetShowAnnotations = useCallback((show: boolean) => {
    setShowAnnotations(show);
    setPreferences({ showAnnotations: show });
  }, []);

  // Setup sync listeners
  useEffect(() => {
    const cleanup = setupSyncListeners((isOnline) => {
      setOnline(isOnline);
      if (isOnline) {
        notifications.show({
          title: "Back online",
          message: "Your changes will sync to the Weave.",
          color: "green",
        });
      } else {
        notifications.show({
          title: "You're offline",
          message: "Your engines will sync when you're back online.",
          color: "yellow",
        });
      }
    });

    return cleanup;
  }, []);

  if (!currentEngine) {
    return (
      <Container>
        <Text>Loading engine...</Text>
      </Container>
    );
  }

  return (
    <AppShell padding="md">
      <AppShell.Main>
        {/* Roll display */}
        <Transition mounted={!!roll} transition="fade" duration={200}>
          {(styles) => (
            <Paper className={classes.rollDisplay} style={styles} shadow="lg" p="xl" radius="md">
              <Text size="xl" fw={700}>
                {roll?.total}
              </Text>
            </Paper>
          )}
        </Transition>

        <Container size="lg" className={classes.container}>
          <Stack gap="md" align="center">
            <Title order={1} className={classes.heading}>
              Hex Flower Engine
            </Title>

            {!online && (
              <Badge color="yellow" variant="light">
                Offline Mode
              </Badge>
            )}

            <Grid
              engine={currentEngine}
              activeHex={activeHex ?? currentEngine.start}
              setActiveHex={setActiveHex}
              showAnnotations={showAnnotations}
            />

            {/* Status display */}
            {activeHexInfo?.label && (
              <Paper p="md" radius="md" className={classes.status}>
                <Title order={2} size="h4">
                  {activeHexInfo.label}
                </Title>

                {activeHexInfo.description && (
                  <Text size="sm" c="dimmed" mt="xs">
                    {activeHexInfo.description}
                  </Text>
                )}

                {activeHexInfo.modifiers && activeHexInfo.modifiers.length > 0 && (
                  <List size="sm" mt="sm">
                    {activeHexInfo.modifiers.map((mod) => (
                      <List.Item key={mod.key}>
                        <Text component="span" fw={600}>
                          {mod.key}:
                        </Text>{" "}
                        {mod.value}
                      </List.Item>
                    ))}
                  </List>
                )}
              </Paper>
            )}
          </Stack>
        </Container>
      </AppShell.Main>

      <AppShell.Footer>
        <Toolbar
          engines={engines}
          currentEngine={currentEngine}
          setCurrentEngine={setCurrentEngine}
          setActiveHex={setActiveHex}
          setRoll={setRoll}
          showAnnotations={showAnnotations}
          setShowAnnotations={handleSetShowAnnotations}
        />
        <Text size="xs" ta="center" c="dimmed" pb="xs">
          v1.0.0
        </Text>
      </AppShell.Footer>
    </AppShell>
  );
}

// Placeholder components for future routes
function Gallery() {
  return (
    <Container>
      <Title>Public Gallery</Title>
      <Text>Coming soon...</Text>
    </Container>
  );
}

function SharedView() {
  return (
    <Container>
      <Title>Shared Engine</Title>
      <Text>Coming soon...</Text>
    </Container>
  );
}

function AdminReview() {
  return (
    <Container>
      <Title>Admin Review</Title>
      <Text>Coming soon...</Text>
    </Container>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HexFlowerRunner />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/s/:token" element={<SharedView />} />
      <Route path="/shared/:token" element={<SharedView />} />
      <Route path="/admin/review" element={<AdminReview />} />
    </Routes>
  );
}

export default App;
