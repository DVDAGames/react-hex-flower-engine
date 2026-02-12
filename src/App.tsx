import { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route, useSearchParams, useNavigate, useParams } from "react-router-dom";
import { Container, Title, Text, Stack, Paper, Badge, List, Transition, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { TermsOfService } from "@/components/TermsOfService";
import { Header } from "@/components/Header";
import { PageLayout } from "@/components/PageLayout";
import { Grid } from "@/components/Grid";
import { Toolbar } from "@/components/Toolbar";
import { HexEditor } from "@/components/Editor";
import { AuthVerify, ProfileModal } from "@/components/Auth";
import { Garden } from "@/components/Garden";
import { SharedEngine } from "@/components/SharedEngine";
import { AdminReview, AdminPreview } from "@/components/Admin";
import { EditorProvider } from "@/contexts/EditorContext";
import { useAuth } from "@/contexts";
import type { EngineDefinition, HexNode } from "@/types/engine";
import { BUILTIN_ENGINES, ROLL_DELAY, ACTIONS, type ActionType } from "@/constants";
import { getEngine, saveEngineState, retrieveEngineState } from "@/lib/api";
import { setCurrentEngineId, getEngineState, setEngineState, setupSyncListeners, isOnline } from "@/services";

import classes from "./App.module.css";
import { About } from "./components/About";

interface RollResult {
  type: ActionType;
  total: number;
}

function HexFlowerRunner() {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isBasicEngine, setIsBasicEngine] = useState(true);
  const [currentEngine, setCurrentEngine] = useState<EngineDefinition | null>(null);
  const [engineId, setEngineId] = useState<string | null>(null);
  const [activeHex, setActiveHex] = useState<number | null>(null);
  const [activeHexInfo, setActiveHexInfo] = useState<HexNode | null>(null);
  const [roll, setRoll] = useState<RollResult | null>(null);
  const [isLoadingEngine, setIsLoadingEngine] = useState(false);
  const [online, setOnline] = useState(isOnline());

  // Ref to track current activeHex without causing effect re-runs
  const activeHexRef = useRef<number | null>(null);
  activeHexRef.current = activeHex;

  // Load engine from query param, user's default engine, or built-in engine
  useEffect(() => {
    // Wait for auth to finish loading before deciding on default engine
    if (authLoading) return;

    // If a builtin query param is present, load a built-in engine by name (takes precedence)
    const builtin = searchParams.get("builtin");
    if (builtin) {
      const match = BUILTIN_ENGINES.find((e) => e.name.toLowerCase() === builtin.toLowerCase());
      if (match) {
        setCurrentEngine(match);
        setActiveHex(match.start);
        setIsBasicEngine(true);
        setEngineId(null);
        return;
      }
    }

    const urlEngineId = searchParams.get("engine");

    if (urlEngineId) {
      // Load engine from URL query param
      setIsLoadingEngine(true);
      getEngine(urlEngineId).then(({ data, error }) => {
        if (data && !error) {
          const engineDef = data.definition as EngineDefinition;
          setCurrentEngine(engineDef);
          setEngineId(urlEngineId);
          setCurrentEngineId(engineDef.name);

          // Try to restore saved state for this engine id
          getSavedEngineState(urlEngineId)
            .then((savedHex) => {
              if (savedHex) {
                setActiveHex(savedHex);
              } else {
                setActiveHex(engineDef.start);
              }
            })
            .catch(() => {
              setActiveHex(engineDef.start);
            })
            .finally(() => {
              setIsLoadingEngine(false);
            });
        } else {
          // Fall back to default engine on error
          console.error("Failed to load engine:", error);
          setCurrentEngine(BUILTIN_ENGINES[0]);
          setIsLoadingEngine(false);
        }
        setIsBasicEngine(false);
      });
    } else if (isAuthenticated && user?.defaultEngineId) {
      // Load user's default engine
      setIsLoadingEngine(true);
      getEngine(user.defaultEngineId).then(({ data, error }) => {
        if (data && !error) {
          const engineDef = data.definition as EngineDefinition;
          setCurrentEngine(engineDef);
          setActiveHex(engineDef.start);
          setIsBasicEngine(false);
          setEngineId(user.defaultEngineId);
          getSavedEngineState(user.defaultEngineId!)
            .then((savedHex) => {
              if (savedHex) {
                setActiveHex(savedHex);
              }
            })
            .catch(() => {
              setActiveHex(engineDef.start);
            })
            .finally(() => {
              setIsLoadingEngine(false);
            });
        } else {
          // Fall back to built-in engine on error
          console.error("Failed to load default engine:", error);
          setCurrentEngine(BUILTIN_ENGINES[0]);
          setIsBasicEngine(true);
        }

        setIsLoadingEngine(false);
      });
    } else {
      // No engine ID in URL and no default - use built-in Standard engine
      setCurrentEngine(BUILTIN_ENGINES[0]);
      setIsBasicEngine(true);
    }
  }, [searchParams, authLoading, isAuthenticated, user?.defaultEngineId]);

  // Load engine state when engine changes (only for non-URL engines)
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
  }, [currentEngine, searchParams]);

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
    if (!roll || !currentEngine) return;

    const currentActiveHex = activeHexRef.current;
    if (currentActiveHex === null) return;

    // Clear roll display after delay
    const timeout = setTimeout(() => {
      setRoll(null);
    }, ROLL_DELAY);

    return () => clearTimeout(timeout);
  }, [roll, currentEngine]);

  // Setup sync listeners
  useEffect(() => {
    const cleanup = setupSyncListeners((online: boolean) => {
      setOnline(online);
      if (online) {
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

  const getSavedEngineState = useCallback(
    async (engineId: string) => {
      if (!engineId) return null;

      try {
        const { data, error } = await retrieveEngineState(engineId);
        if (data && !error) {
          return data.activeHex;
        }
      } catch (err) {
        console.error("Error retrieving engine state:", err);
      }

      return null;
    },
    [engineId],
  );

  // Save engine state to the database
  const saveStateToDatabase = useCallback(async () => {
    if (!currentEngine || !activeHex || isBasicEngine || !engineId) return;

    try {
      const { error } = await saveEngineState(engineId, activeHex);
      if (error) {
        console.error("Failed to save engine state:", error);
      }
    } catch (err) {
      console.error("Error saving engine state:", err);
    }
  }, [currentEngine, activeHex, isBasicEngine, engineId]);

  // Save state on toolbar actions
  const handleToolbarAction = (action: ActionType, rollTotal: number) => {
    switch (action) {
      case ACTIONS.RANDOM:
        setActiveHex(rollTotal);
        break;

      case ACTIONS.RUN:
        const direction = currentEngine?.directions[rollTotal];

        // If direction is 'stay', don't move
        if (direction === "stay") {
          break;
        }

        const currentNode = currentEngine?.nodes.find(({ id }) => id === activeHex);

        if (direction && currentNode) {
          const newNodeId = currentNode.map[direction];

          if (newNodeId) {
            setActiveHex(newNodeId);
          }
        }

        break;

      default:
        break;
    }

    saveStateToDatabase();
  };

  if (!currentEngine || isLoadingEngine) {
    return (
      <Container size="lg" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading engine...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <PageLayout>
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
            {isBasicEngine ? "Hex Flower Engine" : currentEngine.name}
          </Title>

          {!online && (
            <Badge color="yellow" variant="light">
              Offline Mode
            </Badge>
          )}

          <Grid engine={currentEngine} activeHex={activeHex ?? currentEngine.start} setActiveHex={setActiveHex} />

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
        <Toolbar
          currentEngine={currentEngine}
          setActiveHex={setActiveHex}
          setRoll={setRoll}
          onAction={handleToolbarAction} // Pass the new handler
        />
      </Container>
    </PageLayout>
  );
}

function EditorPage() {
  const { engineId } = useParams();

  return (
    <EditorProvider>
      <HexEditor engineId={engineId} />
    </EditorProvider>
  );
}

// Route guard component that redirects to profile setup if terms not accepted
function RequireTerms({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !user?.acceptTerms) {
      navigate("/profile-setup", { replace: true });
    }
  }, [isAuthenticated, user?.acceptTerms, navigate]);

  if (isAuthenticated && !user?.acceptTerms) {
    return null;
  }

  return <>{children}</>;
}

export function UserProfileTerms() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // When user accepts terms, redirect to home
  useEffect(() => {
    console.log("user?.acceptTerms:", user?.acceptTerms, "isAuthenticated:", isAuthenticated, "isAuthLoading:", isAuthLoading);

    if ((isAuthenticated && user?.acceptTerms) || (!isAuthenticated && !isAuthLoading)) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, user?.acceptTerms, isAuthLoading, navigate]);

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <ProfileModal title="Create Your Account" opened={true} onClose={() => {}} centered withCloseButton={false} />
      </Stack>
    </Container>
  );
}

export function App() {
  const { isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <Container size="lg" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <RequireTerms>
              <HexFlowerRunner />
            </RequireTerms>
          }
        />
        <Route path="/auth/verify" element={<AuthVerify />} />
        <Route
          path="/editor"
          element={
            <RequireTerms>
              <EditorPage />
            </RequireTerms>
          }
        />
        <Route
          path="/editor/:engineId"
          element={
            <RequireTerms>
              <EditorPage />
            </RequireTerms>
          }
        />
        <Route
          path="/garden"
          element={
            <RequireTerms>
              <Garden />
            </RequireTerms>
          }
        />
        <Route path="/s/:token" element={<SharedEngine />} />
        <Route path="/shared/:token" element={<SharedEngine />} />
        <Route
          path="/admin/review"
          element={
            <RequireTerms>
              <AdminReview />
            </RequireTerms>
          }
        />
        <Route
          path="/admin/review/:engineId"
          element={
            <RequireTerms>
              <AdminPreview />
            </RequireTerms>
          }
        />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/profile-setup" element={<UserProfileTerms />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

export default App;
