import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
  Tabs,
  SegmentedControl,
} from "@mantine/core";
import { CheckCircle, XCircle, AlertTriangle, User, Calendar, ArrowLeft, Eye, Flower2, Clock, History, Globe, Trash2, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts";
import { getPendingEngines, getReviewHistory, reviewEngine, getGalleryEngines, unpublishEngine, cascadeDeleteEngine, type PendingEngine, type ReviewedEngine, type Engine } from "@/lib/api";
import { PageLayout } from "@/components/PageLayout";
import type { EngineDefinition } from "@/types/engine";
import classes from "./AdminReview.module.css";

export function AdminReview() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>("pending");

  // Pending state
  const [pendingEngines, setPendingEngines] = useState<PendingEngine[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  // History state
  const [historyEngines, setHistoryEngines] = useState<ReviewedEngine[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "approved" | "rejected">("all");
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Published state
  const [publishedEngines, setPublishedEngines] = useState<Engine[]>([]);
  const [publishedLoading, setPublishedLoading] = useState(false);

  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [rejectingEngine, setRejectingEngine] = useState<PendingEngine | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Cascade delete state
  const [engineToDelete, setEngineToDelete] = useState<Engine | null>(null);
  const [showCascadeConfirm, setShowCascadeConfirm] = useState(false);
  const [cascadeConfirmation, setCascadeConfirmation] = useState("");

  const loadPendingEngines = useCallback(async () => {
    setPendingLoading(true);
    setError(null);

    const { data, error: apiError } = await getPendingEngines();

    if (apiError) {
      setError(apiError);
    } else if (data) {
      setPendingEngines(data.engines);
    }

    setPendingLoading(false);
  }, []);

  const loadHistoryEngines = useCallback(async (filter: "all" | "approved" | "rejected") => {
    setHistoryLoading(true);
    setError(null);

    const { data, error: apiError } = await getReviewHistory(filter);

    if (apiError) {
      setError(apiError);
    } else if (data) {
      setHistoryEngines(data.engines);
    }

    setHistoryLoading(false);
    setHistoryLoaded(true);
  }, []);

  const loadPublishedEngines = useCallback(async () => {
    setPublishedLoading(true);
    setError(null);

    const { data, error: apiError } = await getGalleryEngines();

    if (apiError) {
      setError(apiError);
    } else if (data) {
      setPublishedEngines(data);
    }

    setPublishedLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      loadPendingEngines();
    }
  }, [isAuthenticated, user?.isAdmin, loadPendingEngines]);

  // Load history when tab changes or filter changes
  useEffect(() => {
    if (activeTab === "history" && isAuthenticated && user?.isAdmin) {
      loadHistoryEngines(historyFilter);
    }
  }, [activeTab, historyFilter, isAuthenticated, user?.isAdmin, loadHistoryEngines]);

  // Load published engines when tab changes
  useEffect(() => {
    if (activeTab === "published" && isAuthenticated && user?.isAdmin) {
      loadPublishedEngines();
    }
  }, [activeTab, isAuthenticated, user?.isAdmin, loadPublishedEngines]);

  const handleApprove = async (engineId: string) => {
    setActionLoading(engineId);
    const { error: apiError } = await reviewEngine(engineId, "approve");

    if (apiError) {
      setError(apiError);
    } else {
      setPendingEngines((prev) => prev.filter((e) => e.id !== engineId));
      // Refresh history if it was loaded
      if (historyLoaded) {
        loadHistoryEngines(historyFilter);
      }
    }

    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!rejectingEngine) return;

    setActionLoading(rejectingEngine.id);
    const { error: apiError } = await reviewEngine(rejectingEngine.id, "reject", rejectReason || undefined);

    if (apiError) {
      setError(apiError);
    } else {
      setPendingEngines((prev) => prev.filter((e) => e.id !== rejectingEngine.id));
      setRejectingEngine(null);
      setRejectReason("");
      // Refresh history if it was loaded
      if (historyLoaded) {
        loadHistoryEngines(historyFilter);
      }
    }

    setActionLoading(null);
  };

  const handleUnpublish = async (engineId: string) => {
    if (!confirm("Are you sure you want to unpublish this engine? It will be removed from The Garden but users who saved it can still use it.")) {
      return;
    }

    setActionLoading(engineId);
    const { error: apiError } = await unpublishEngine(engineId);

    if (apiError) {
      setError(apiError);
    } else {
      setPublishedEngines((prev) => prev.filter((e) => e.id !== engineId));
    }

    setActionLoading(null);
  };

  const handleCascadeDeleteStart = (engine: Engine) => {
    setEngineToDelete(engine);
    setCascadeConfirmation("");
  };

  const handleCascadeDeleteConfirm = () => {
    setShowCascadeConfirm(true);
  };

  const handleCascadeDeleteExecute = async () => {
    if (!engineToDelete) return;

    const def = engineToDelete.definition as any;
    const engineName = def.name;

    if (cascadeConfirmation !== engineName) {
      setError("Engine name does not match. Please type the exact name to confirm.");
      return;
    }

    setActionLoading(engineToDelete.id);
    const { error: apiError } = await cascadeDeleteEngine(engineToDelete.id, cascadeConfirmation);

    if (apiError) {
      setError(apiError);
    } else {
      setPublishedEngines((prev) => prev.filter((e) => e.id !== engineToDelete.id));
      setEngineToDelete(null);
      setShowCascadeConfirm(false);
      setCascadeConfirmation("");
    }

    setActionLoading(null);
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

  return (
    <PageLayout>
      <Container w="100%" fluid size="lg" py="xl" className={classes.container}>
        <Group justify="space-between" mb="xl" w="100%">
          <Group gap="md">
            <Button component={Link} to="/" variant="subtle" leftSection={<ArrowLeft size={16} />}>
              Back
            </Button>
            <Title order={2}>
              <Group gap="xs">
                <Flower2 size={28} />
                Admin Review
              </Group>
            </Title>
          </Group>
          {pendingEngines.length > 0 && (
            <Badge size="lg" color="violet">
              {pendingEngines.length} pending
            </Badge>
          )}
        </Group>

        {error && (
          <Alert icon={<AlertTriangle size={20} />} color="red" mb="md" withCloseButton onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="md">
            <Tabs.Tab value="pending" leftSection={<Clock size={16} />}>
              Pending Review
              {pendingEngines.length > 0 && (
                <Badge size="sm" color="yellow" ml="xs">
                  {pendingEngines.length}
                </Badge>
              )}
            </Tabs.Tab>
            <Tabs.Tab value="published" leftSection={<Globe size={16} />}>
              Published
              {publishedEngines.length > 0 && (
                <Badge size="sm" color="green" ml="xs">
                  {publishedEngines.length}
                </Badge>
              )}
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<History size={16} />}>
              History
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="pending">
            {pendingLoading ? (
              <Stack align="center" py="xl">
                <Loader size="lg" />
                <Text c="dimmed">Loading pending engines...</Text>
              </Stack>
            ) : pendingEngines.length === 0 ? (
              <Card withBorder p="xl">
                <Stack align="center" gap="md">
                  <CheckCircle size={48} opacity={0.3} />
                  <Text c="dimmed" size="lg">
                    No engines pending review
                  </Text>
                  <Text c="dimmed" size="sm">
                    All caught up! 🎉
                  </Text>
                </Stack>
              </Card>
            ) : (
              <Stack gap="md">
                {pendingEngines.map((engine) => {
                  const def = engine.definition as EngineDefinition;
                  return (
                    <Card key={engine.id} withBorder className={classes.engineCard}>
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Stack gap="xs" style={{ flex: 1 }}>
                          <Group gap="xs">
                            <Text fw={700} size="lg">
                              {def.name}
                            </Text>
                            <Badge color="yellow" size="sm">
                              Pending Review
                            </Badge>
                          </Group>

                          {def.description && (
                            <Text c="dimmed" lineClamp={2}>
                              {def.description}
                            </Text>
                          )}

                          <Group gap="lg" mt="xs">
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
                          </Group>

                          <Group gap="xs" mt="sm">
                            <Text size="sm" c="dimmed">
                              {def.nodes.length} hexes • Roll: {def.roll}
                            </Text>
                          </Group>
                        </Stack>

                        <Stack gap="xs">
                          <Button
                            component={Link}
                            to={`/admin/review/${engine.id}`}
                            variant="light"
                            leftSection={<Eye size={16} />}
                          >
                            Preview
                          </Button>

                          <Button
                            color="green"
                            leftSection={<CheckCircle size={16} />}
                            onClick={() => handleApprove(engine.id)}
                            loading={actionLoading === engine.id}
                            disabled={actionLoading !== null}
                          >
                            Approve
                          </Button>

                          <Button
                            color="red"
                            variant="light"
                            leftSection={<XCircle size={16} />}
                            onClick={() => setRejectingEngine(engine)}
                            disabled={actionLoading !== null}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="published">
            {publishedLoading ? (
              <Stack align="center" py="xl">
                <Loader size="lg" />
                <Text c="dimmed">Loading published engines...</Text>
              </Stack>
            ) : publishedEngines.length === 0 ? (
              <Card withBorder p="xl">
                <Stack align="center" gap="md">
                  <Globe size={48} opacity={0.3} />
                  <Text c="dimmed" size="lg">
                    No published engines
                  </Text>
                </Stack>
              </Card>
            ) : (
              <Stack gap="md">
                {publishedEngines.map((engine) => {
                  const def = engine.definition as any;
                  const engineWithOwner = engine as Engine & { ownerName?: string };
                  return (
                    <Card key={engine.id} withBorder className={classes.engineCard}>
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Stack gap="xs" style={{ flex: 1 }}>
                          <Group gap="xs">
                            <Text fw={700} size="lg">
                              {def.name}
                            </Text>
                            <Badge color="green" size="sm">
                              Published
                            </Badge>
                            {engine.isSystemDefault && (
                              <Badge variant="light" color="blue" size="sm">
                                System
                              </Badge>
                            )}
                          </Group>

                          {def.description && (
                            <Text c="dimmed" lineClamp={2}>
                              {def.description}
                            </Text>
                          )}

                          <Group gap="lg" mt="xs">
                            <Group gap={4}>
                              <User size={14} opacity={0.6} />
                              <Text size="sm" c="dimmed">
                                {engineWithOwner.ownerName || "Unknown"}
                              </Text>
                            </Group>
                            <Text size="sm" c="dimmed">
                              {def.nodes?.length || 0} hexes • Roll: {def.roll}
                            </Text>
                            {engine.useCount > 0 && (
                              <Text size="sm" c="dimmed">
                                {engine.useCount} uses
                              </Text>
                            )}
                            {(engine.forkCount || 0) > 0 && (
                              <Text size="sm" c="dimmed">
                                {engine.forkCount} forks
                              </Text>
                            )}
                          </Group>
                        </Stack>

                        <Stack gap="xs">
                          <Button
                            color="orange"
                            variant="light"
                            leftSection={<EyeOff size={16} />}
                            onClick={() => handleUnpublish(engine.id)}
                            loading={actionLoading === engine.id}
                            disabled={actionLoading !== null}
                            size="sm"
                          >
                            Unpublish
                          </Button>

                          <Button
                            color="red"
                            variant="outline"
                            leftSection={<Trash2 size={16} />}
                            onClick={() => handleCascadeDeleteStart(engine)}
                            disabled={actionLoading !== null}
                            size="sm"
                          >
                            Emergency Delete
                          </Button>
                        </Stack>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="history">
            <Group mb="md">
              <SegmentedControl
                value={historyFilter}
                onChange={(value) => setHistoryFilter(value as "all" | "approved" | "rejected")}
                data={[
                  { label: "All", value: "all" },
                  { label: "Approved", value: "approved" },
                  { label: "Rejected", value: "rejected" },
                ]}
              />
            </Group>

            {historyLoading ? (
              <Stack align="center" py="xl">
                <Loader size="lg" />
                <Text c="dimmed">Loading review history...</Text>
              </Stack>
            ) : historyEngines.length === 0 ? (
              <Card withBorder p="xl">
                <Stack align="center" gap="md">
                  <History size={48} opacity={0.3} />
                  <Text c="dimmed" size="lg">
                    No review history
                  </Text>
                  <Text c="dimmed" size="sm">
                    {historyFilter === "all" ? "No engines have been reviewed yet" : `No ${historyFilter} engines found`}
                  </Text>
                </Stack>
              </Card>
            ) : (
              <Stack gap="md">
                {historyEngines.map((engine) => {
                  const def = engine.definition as EngineDefinition;
                  const isApproved = engine.visibility === "public";

                  return (
                    <Card key={engine.id} withBorder className={classes.engineCard}>
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Stack gap="xs" style={{ flex: 1 }}>
                          <Group gap="xs">
                            <Text fw={700} size="lg">
                              {def.name}
                            </Text>
                            <Badge
                              color={isApproved ? "green" : "red"}
                              size="sm"
                              leftSection={isApproved ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            >
                              {isApproved ? "Approved" : "Rejected"}
                            </Badge>
                          </Group>

                          {def.description && (
                            <Text c="dimmed" lineClamp={2}>
                              {def.description}
                            </Text>
                          )}

                          {!isApproved && engine.rejectionReason && (
                            <Alert color="red" variant="light" p="xs">
                              <Text size="sm">
                                <strong>Reason:</strong> {engine.rejectionReason}
                              </Text>
                            </Alert>
                          )}

                          <Group gap="lg" mt="xs">
                            <Group gap={4}>
                              <User size={14} opacity={0.6} />
                              <Text size="sm" c="dimmed">
                                {engine.user.displayName || engine.user.email}
                              </Text>
                            </Group>
                            <Group gap={4}>
                              <Calendar size={14} opacity={0.6} />
                              <Text size="sm" c="dimmed">
                                Reviewed {new Date(engine.reviewedAt).toLocaleDateString()}
                              </Text>
                            </Group>
                            {engine.reviewer && (
                              <Text size="sm" c="dimmed">
                                by {engine.reviewer.displayName || engine.reviewer.email}
                              </Text>
                            )}
                          </Group>

                          <Group gap="xs" mt="sm">
                            <Text size="sm" c="dimmed">
                              {def.nodes.length} hexes • Roll: {def.roll}
                              {isApproved && engine.useCount > 0 && ` • ${engine.useCount} uses`}
                            </Text>
                          </Group>
                        </Stack>

                        <Stack gap="xs">
                          {isApproved && (
                            <Button component={Link} to={`/gallery`} variant="light" size="sm">
                              View in Garden
                            </Button>
                          )}
                        </Stack>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Tabs.Panel>
        </Tabs>

        {/* Reject Modal */}
        <Modal
          opened={!!rejectingEngine}
          onClose={() => {
            setRejectingEngine(null);
            setRejectReason("");
          }}
          title="Reject Engine"
        >
          <Stack gap="md">
            <Text>
              Are you sure you want to reject{" "}
              <strong>{rejectingEngine ? (rejectingEngine.definition as EngineDefinition).name : ""}</strong>?
            </Text>
            <Text size="sm" c="dimmed">
              The engine will be returned to private status. You can optionally provide a reason.
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
                  setRejectingEngine(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                color="red"
                leftSection={<XCircle size={16} />}
                onClick={handleReject}
                loading={actionLoading === rejectingEngine?.id}
              >
                Reject Engine
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Cascade Delete - First Warning Modal */}
        <Modal
          opened={!!engineToDelete && !showCascadeConfirm}
          onClose={() => {
            setEngineToDelete(null);
            setCascadeConfirmation("");
          }}
          title="Emergency Delete - Remove All Copies"
          size="md"
        >
          <Stack gap="md">
            <Alert color="red" icon={<AlertTriangle size={20} />}>
              <Text fw={600} mb="xs">
                Warning: This will delete the engine AND all user-created forks
              </Text>
              <Text size="sm">
                {engineToDelete && `This engine has ${(engineToDelete as any).forkCount || 0} fork(s). All copies will be permanently deleted.`}
              </Text>
            </Alert>

            <Text>
              This action should only be used for inappropriate content or emergency situations.
            </Text>

            <Text size="sm" c="dimmed">
              Engine: <strong>{engineToDelete ? (engineToDelete.definition as any).name : ""}</strong>
            </Text>

            <Group justify="flex-end" gap="sm">
              <Button
                variant="subtle"
                onClick={() => {
                  setEngineToDelete(null);
                  setCascadeConfirmation("");
                }}
              >
                Cancel
              </Button>
              <Button
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={handleCascadeDeleteConfirm}
              >
                Proceed to Confirmation
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Cascade Delete - Final Confirmation Modal */}
        <Modal
          opened={showCascadeConfirm && !!engineToDelete}
          onClose={() => {
            setShowCascadeConfirm(false);
            setEngineToDelete(null);
            setCascadeConfirmation("");
          }}
          title="Final Confirmation"
          size="md"
        >
          <Stack gap="md">
            <Text>
              You are about to permanently delete{" "}
              <strong>{engineToDelete ? (engineToDelete.definition as any).name : ""}</strong> and{" "}
              {engineToDelete ? (engineToDelete as any).forkCount || 0 : 0} user fork(s).
            </Text>

            <Alert color="red" variant="filled">
              <Text fw={600}>This cannot be undone!</Text>
            </Alert>

            <Text size="sm" c="dimmed">
              Type the engine name exactly to confirm:
            </Text>

            <Textarea
              placeholder={engineToDelete ? (engineToDelete.definition as any).name : ""}
              value={cascadeConfirmation}
              onChange={(e) => setCascadeConfirmation(e.currentTarget.value)}
              rows={1}
            />

            <Group justify="flex-end" gap="sm">
              <Button
                variant="subtle"
                onClick={() => {
                  setShowCascadeConfirm(false);
                  setEngineToDelete(null);
                  setCascadeConfirmation("");
                }}
              >
                Cancel
              </Button>
              <Button
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={handleCascadeDeleteExecute}
                loading={actionLoading === engineToDelete?.id}
                disabled={!engineToDelete || cascadeConfirmation !== (engineToDelete.definition as any).name}
              >
                Permanently Delete
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </PageLayout>
  );
}

export default AdminReview;
