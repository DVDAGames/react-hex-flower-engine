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
import { CheckCircle, XCircle, AlertTriangle, User, Calendar, ArrowLeft, Eye, Flower2, Clock, History } from "lucide-react";
import { useAuth } from "@/contexts";
import { getPendingEngines, getReviewHistory, reviewEngine, type PendingEngine, type ReviewedEngine } from "@/lib/api";
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

  // Shared state
  const [error, setError] = useState<string | null>(null);
  const [rejectingEngine, setRejectingEngine] = useState<PendingEngine | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      <Container size="lg" py="xl" className={classes.container}>
        <Group justify="space-between" mb="xl">
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
      </Container>
    </PageLayout>
  );
}

export default AdminReview;
