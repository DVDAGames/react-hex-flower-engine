import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Stack,
  Button,
  Badge,
  Loader,
  Alert,
  Textarea,
  Modal,
  Paper,
  Divider,
  AppShell,
} from "@mantine/core";
import { CheckCircle, XCircle, AlertTriangle, User, Calendar, ArrowLeft, Info, Flower2 } from "lucide-react";
import { useAuth } from "@/contexts";
import { getPendingEngines, reviewEngine, type PendingEngine } from "@/lib/api";
import { Grid } from "@/components/Grid";
import { PageLayout } from "@/components/PageLayout";
import type { EngineDefinition, HexNode } from "@/types/engine";
import classes from "./AdminPreview.module.css";

export function AdminPreview() {
  const { engineId } = useParams<{ engineId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  const [engine, setEngine] = useState<PendingEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHex, setActiveHex] = useState<number | null>(null);
  const [selectedHexInfo, setSelectedHexInfo] = useState<HexNode | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const loadEngine = useCallback(async () => {
    if (!engineId) return;

    setIsLoading(true);
    setError(null);

    const { data, error: apiError } = await getPendingEngines();

    if (apiError) {
      setError(apiError);
    } else if (data) {
      const found = data.engines.find((e) => e.id === engineId);
      if (found) {
        setEngine(found);
        const def = found.definition as EngineDefinition;
        setActiveHex(def.start);
        const startHex = def.nodes.find((n) => n.id === def.start);
        setSelectedHexInfo(startHex || null);
      } else {
        setError("Engine not found or not pending review");
      }
    }

    setIsLoading(false);
  }, [engineId]);

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      loadEngine();
    }
  }, [isAuthenticated, user?.isAdmin, loadEngine]);

  const handleHexClick = (hexId: number) => {
    if (!engine) return;
    setActiveHex(hexId);
    const def = engine.definition as EngineDefinition;
    const hexInfo = def.nodes.find((n) => n.id === hexId);
    setSelectedHexInfo(hexInfo || null);
  };

  const handleApprove = async () => {
    if (!engine) return;

    setActionLoading(true);
    const { error: apiError } = await reviewEngine(engine.id, "approve");

    if (apiError) {
      setError(apiError);
      setActionLoading(false);
    } else {
      navigate("/admin/review", { state: { message: "Engine approved successfully!" } });
    }
  };

  const handleReject = async () => {
    if (!engine) return;

    setActionLoading(true);
    const { error: apiError } = await reviewEngine(engine.id, "reject", rejectReason || undefined);

    if (apiError) {
      setError(apiError);
      setActionLoading(false);
    } else {
      navigate("/admin/review", { state: { message: "Engine rejected" } });
    }
  };

  // Auth loading
  if (authLoading) {
    return (
      <PageLayout>
        <Container size="md" py="xl">
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading...</Text>
          </Stack>
        </Container>
      </PageLayout>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <Container size="md" py="xl">
          <Alert icon={<AlertTriangle size={20} />} color="yellow" title="Sign In Required">
            Please sign in to access the admin panel.
          </Alert>
        </Container>
      </PageLayout>
    );
  }

  // Not admin
  if (!user?.isAdmin) {
    return (
      <PageLayout>
        <Container size="md" py="xl">
          <Alert icon={<AlertTriangle size={20} />} color="red" title="Access Denied">
            You do not have permission to access this page.
          </Alert>
        </Container>
      </PageLayout>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <PageLayout>
        <Container size="md" py="xl">
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading engine...</Text>
          </Stack>
        </Container>
      </PageLayout>
    );
  }

  // Error or not found
  if (error || !engine) {
    return (
      <PageLayout>
        <Container size="md" py="xl">
          <Stack gap="md">
            <Alert icon={<AlertTriangle size={20} />} color="red">
              {error || "Engine not found"}
            </Alert>
            <Button component={Link} to="/admin/review" variant="light" leftSection={<ArrowLeft size={16} />}>
              Back to Review Queue
            </Button>
          </Stack>
        </Container>
      </PageLayout>
    );
  }

  const def = engine.definition as EngineDefinition;
  return (
    <AppShell className={classes.container} header={{ height: 70 }} padding={0}>
      <AppShell.Header className={classes.header}>
        <Group h="100%" px="md" justify="space-between">
          {/* Left: Back button and title */}
          <Group gap="md">
            <Button component={Link} to="/admin/review" variant="subtle" leftSection={<ArrowLeft size={16} />}>
              Back
            </Button>
            <Divider orientation="vertical" />
            <Group gap="xs">
              <Flower2 size={24} />
              <Title order={3}>{def.name}</Title>
              <Badge color="yellow">Pending Review</Badge>
            </Group>
          </Group>

          {/* Right: Actions */}
          <Group gap="sm">
            <Button
              color="red"
              variant="light"
              leftSection={<XCircle size={16} />}
              onClick={() => setRejectModalOpen(true)}
              disabled={actionLoading}
            >
              Reject
            </Button>
            <Button color="green" leftSection={<CheckCircle size={16} />} onClick={handleApprove} loading={actionLoading}>
              Approve
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main className={classes.main}>
        <div className={classes.content}>
          {/* Grid area */}
          <div className={classes.gridArea}>
            <Grid engine={def} activeHex={activeHex ?? def.start} setActiveHex={handleHexClick} />
          </div>

          {/* Sidebar */}
          <div className={classes.sidebar}>
            {/* Engine Info */}
            <Card withBorder>
              <Stack gap="sm">
                <Text fw={600}>Engine Info</Text>
                <Divider />

                {def.description && <Text size="sm">{def.description}</Text>}

                <Group gap="lg">
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      Hexes
                    </Text>
                    <Text size="sm" fw={500}>
                      {def.nodes.length}
                    </Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      Roll
                    </Text>
                    <Text size="sm" fw={500}>
                      {def.roll}
                    </Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      Start
                    </Text>
                    <Text size="sm" fw={500}>
                      Hex {def.start}
                    </Text>
                  </Stack>
                </Group>

                <Divider />

                <Group gap={4}>
                  <User size={14} opacity={0.6} />
                  <Text size="sm" c="dimmed">
                    {engine.user.displayName || engine.user.email}
                  </Text>
                </Group>
                <Group gap={4}>
                  <Calendar size={14} opacity={0.6} />
                  <Text size="sm" c="dimmed">
                    Submitted {new Date(engine.submittedAt).toLocaleDateString()}
                  </Text>
                </Group>
              </Stack>
            </Card>

            {/* Hex Details */}
            <Card withBorder>
              <Stack gap="sm">
                <Group gap="xs">
                  <Info size={16} />
                  <Text fw={600}>Selected Hex</Text>
                </Group>

                <Divider />

                {selectedHexInfo ? (
                  <>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        ID
                      </Text>
                      <Badge variant="light">{selectedHexInfo.id}</Badge>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Label
                      </Text>
                      <Text size="sm" fw={500}>
                        {selectedHexInfo.label || "(none)"}
                      </Text>
                    </Group>

                    {selectedHexInfo.description && (
                      <>
                        <Text size="sm" c="dimmed">
                          Description
                        </Text>
                        <Paper p="xs" bg="var(--mantine-color-dark-6)">
                          <Text size="sm">{selectedHexInfo.description}</Text>
                        </Paper>
                      </>
                    )}

                    {selectedHexInfo.style?.icon && (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Icon
                        </Text>
                        <Text size="sm">{selectedHexInfo.style.icon}</Text>
                      </Group>
                    )}

                    {selectedHexInfo.style?.backgroundColor && (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Background
                        </Text>
                        <Group gap="xs">
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              backgroundColor: selectedHexInfo.style.backgroundColor,
                              border: "1px solid var(--mantine-color-dark-4)",
                            }}
                          />
                          <Text size="sm">{selectedHexInfo.style.backgroundColor}</Text>
                        </Group>
                      </Group>
                    )}

                    {selectedHexInfo.modifiers && selectedHexInfo.modifiers.length > 0 && (
                      <>
                        <Text size="sm" c="dimmed">
                          Modifiers
                        </Text>
                        <Stack gap={4}>
                          {selectedHexInfo.modifiers.map((mod, i) => (
                            <Badge key={i} variant="outline" size="sm">
                              {mod.key}: {mod.value}
                            </Badge>
                          ))}
                        </Stack>
                      </>
                    )}

                    {selectedHexInfo.map && Object.keys(selectedHexInfo.map).length > 0 && (
                      <>
                        <Text size="sm" c="dimmed">
                          Custom Movement
                        </Text>
                        <Text size="xs" c="dimmed">
                          This hex has custom movement overrides
                        </Text>
                      </>
                    )}

                    {selectedHexInfo.id === def.start && (
                      <Badge color="green" variant="light">
                        Starting Hex
                      </Badge>
                    )}
                  </>
                ) : (
                  <Text size="sm" c="dimmed">
                    Click a hex to see its details
                  </Text>
                )}
              </Stack>
            </Card>
          </div>
        </div>
      </AppShell.Main>

      {/* Reject Modal */}
      <Modal
        opened={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectReason("");
        }}
        title="Reject Engine"
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to reject <strong>{def.name}</strong>?
          </Text>
          <Text size="sm" c="dimmed">
            The engine will be returned to private status. You can optionally provide feedback.
          </Text>

          <Textarea
            label="Rejection Reason (optional)"
            placeholder="Enter feedback for the creator..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.currentTarget.value)}
            rows={3}
          />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => {
                setRejectModalOpen(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button color="red" leftSection={<XCircle size={16} />} onClick={handleReject} loading={actionLoading}>
              Reject Engine
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppShell>
  );
}

export default AdminPreview;
