import { useCallback, useState, useEffect } from "react";
import { AppShell, Group, ActionIcon, Tooltip, Badge, Divider, Text, Tabs, Stack, Paper, Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  Undo2,
  Redo2,
  Save,
  Download,
  Upload,
  FilePlus,
  PanelLeft,
  Play,
  Eye,
  Cloud,
  FolderOpen,
  Settings,
  Hexagon,
} from "lucide-react";

import { useEditor } from "@/contexts/EditorContext";
import { useAuth } from "@/contexts";
import { getEngine } from "@/lib/api";
import { EditorGrid } from "./EditorGrid";
import { HexPropertyPanel } from "./HexPropertyPanel";
import { EngineSettingsPanel } from "./EngineSettingsPanel";
import { MyEnginesModal } from "./MyEnginesModal";
import { SaveEngineModal } from "./SaveEngineModal";

import type { EngineDefinition } from "@/types/engine";
import classes from "./HexEditor.module.css";

export function HexEditor({ engineId }: { engineId?: string }) {
  const { state, actions } = useEditor();
  const { isAuthenticated, user } = useAuth();
  const { draft, mode, panels, selectedHexId } = state;

  // Modal states
  const [myEnginesOpen, setMyEnginesOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [cloudEngineId, setCloudEngineId] = useState<string | null>(engineId || draft.sourceEngineId || null);
  const [hasLoadedDefault, setHasLoadedDefault] = useState(false);

  // Sidebar tab state
  const [activeTab, setActiveTab] = useState<string | null>("engine");

  // Load default editor engine on mount if user has one set
  useEffect(() => {
    if (engineId && isAuthenticated && !hasLoadedDefault) {
      setHasLoadedDefault(true);

      getEngine(engineId).then(({ data, error }) => {
        if (data && !error) {
          const engineDef = data.definition as EngineDefinition;
          actions.importEngine(engineDef, engineDef.name);

          setCloudEngineId(engineId);
        }
      });
    } else if (
      // Only load if:
      // 1. User is authenticated
      // 2. User has a default editor engine set
      // 3. No engine is currently loaded (draft is still the initial empty state)
      // 4. We haven't already loaded the default
      isAuthenticated &&
      user?.defaultEditorEngineId &&
      !hasLoadedDefault &&
      !draft.sourceEngineId &&
      draft.nodes.length === 19 // Check if it's still the default empty engine
    ) {
      setHasLoadedDefault(true);
      getEngine(user.defaultEditorEngineId).then(({ data, error }) => {
        if (data && !error) {
          const engineDef = data.definition as EngineDefinition;
          actions.importEngine(engineDef, engineDef.name);
          setCloudEngineId(user.defaultEditorEngineId!);
        }
      });
    }
  }, [isAuthenticated, user?.defaultEditorEngineId, hasLoadedDefault, draft, actions]);

  // Switch to hex tab when a hex is selected, switch to engine tab when deselected
  useEffect(() => {
    if (selectedHexId !== null) {
      setActiveTab("hex");
    } else {
      setActiveTab("engine");
    }
  }, [selectedHexId]);

  const handleExport = useCallback(() => {
    const engine = actions.exportEngine();
    const blob = new Blob([JSON.stringify(engine, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${engine.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [actions]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const engine = JSON.parse(text);
          actions.importEngine(engine);
          setCloudEngineId(null); // New import, not linked to cloud
        } catch (err) {
          console.error("Failed to parse engine file:", err);
        }
      }
    };
    input.click();
  }, [actions]);

  const handleSave = useCallback(() => {
    actions.saveDraft();
  }, [actions]);

  const handleNew = useCallback(() => {
    if (draft.isDirty) {
      if (!confirm("You have unsaved changes. Create a new engine anyway?")) {
        return;
      }
    }
    actions.createNew();
    setCloudEngineId(null);
  }, [actions, draft.isDirty]);

  const handleLoadFromCloud = useCallback(
    (engine: EngineDefinition, engineId: string) => {
      actions.importEngine(engine, engine.name);
      setCloudEngineId(engineId);
    },
    [actions],
  );

  const handleCloudSaveSuccess = useCallback(
    (engineId: string) => {
      setCloudEngineId(engineId);
      actions.saveDraft(); // Also save locally and mark as clean
    },
    [actions],
  );

  // Sidebar is open if either panel was open (for backwards compatibility)
  const sidebarOpen = panels.hexProperties || panels.engineSettings;

  // Detect small viewports (mobile/tablet)
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <AppShell
      className={classes.editorShell}
      header={{ height: 60 }}
      aside={
        isMobile
          ? undefined // Don't use aside on mobile
          : {
              width: sidebarOpen ? 360 : 0,
              breakpoint: "sm",
              collapsed: { mobile: !sidebarOpen, desktop: !sidebarOpen },
            }
      }
      padding="md"
    >
      <AppShell.Header className={classes.header}>
        <Group h="100%" px="md" justify="space-between">
          {/* Left: File operations */}
          <Group gap="xs">
            <Tooltip label="New Engine">
              <ActionIcon variant="subtle" onClick={handleNew}>
                <FilePlus size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="My Engines">
              <ActionIcon variant="subtle" onClick={() => setMyEnginesOpen(true)}>
                <FolderOpen size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Import JSON">
              <ActionIcon variant="subtle" onClick={handleImport}>
                <Upload size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Export JSON">
              <ActionIcon variant="subtle" onClick={handleExport}>
                <Download size={18} />
              </ActionIcon>
            </Tooltip>

            <Divider orientation="vertical" mx="xs" />

            <Tooltip label="Save Draft (Local)">
              <ActionIcon
                variant={draft.isDirty ? "filled" : "subtle"}
                color={draft.isDirty ? "blue" : undefined}
                onClick={handleSave}
              >
                <Save size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={isAuthenticated ? "Save to Cloud" : "Sign in to save to cloud"}>
              <ActionIcon
                variant={cloudEngineId ? "subtle" : "light"}
                color="violet"
                onClick={() => setSaveModalOpen(true)}
                disabled={!isAuthenticated}
              >
                <Cloud size={18} />
              </ActionIcon>
            </Tooltip>

            <Divider orientation="vertical" mx="xs" />

            <Tooltip label="Undo">
              <ActionIcon variant="subtle" onClick={actions.undo} disabled={!actions.canUndo()}>
                <Undo2 size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Redo">
              <ActionIcon variant="subtle" onClick={actions.redo} disabled={!actions.canRedo()}>
                <Redo2 size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Center: Engine name */}
          <Group gap="xs">
            <Text fw={600} size="lg">
              {draft.name}
            </Text>
            {draft.isDirty && (
              <Badge size="xs" color="yellow">
                Unsaved
              </Badge>
            )}
          </Group>

          {/* Right: Tools and panels */}
          <Group gap="xs">
            {/* Tool selection */}
            <Divider orientation="vertical" mx="xs" />

            {/* Mode toggle */}
            <Tooltip label={mode === "preview" ? "Edit Mode" : "Preview Mode"}>
              <ActionIcon
                variant={mode === "preview" ? "filled" : "subtle"}
                color={mode === "preview" ? "green" : undefined}
                onClick={() => actions.setMode(mode === "preview" ? "select" : "preview")}
              >
                {mode === "preview" ? <Eye size={18} /> : <Play size={18} />}
              </ActionIcon>
            </Tooltip>

            <Divider orientation="vertical" mx="xs" />

            {/* Sidebar toggle */}
            <Tooltip label="Toggle Sidebar">
              <ActionIcon
                variant={sidebarOpen ? "filled" : "subtle"}
                onClick={() => {
                  // Toggle sidebar - ensure both panels are in sync
                  if (sidebarOpen) {
                    // Close both panels
                    if (panels.hexProperties) actions.togglePanel("hexProperties");
                    if (panels.engineSettings) actions.togglePanel("engineSettings");
                  } else {
                    // Open the engineSettings panel (default)
                    if (!panels.engineSettings) actions.togglePanel("engineSettings");
                    if (!panels.hexProperties) actions.togglePanel("hexProperties");
                  }
                }}
              >
                <PanelLeft size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Desktop: Sidebar as aside */}
      {!isMobile && sidebarOpen && (
        <AppShell.Aside className={classes.panel}>
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            orientation="horizontal"
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Tabs.List px="md" pt="md">
              <Tabs.Tab value="engine" leftSection={<Settings size={16} />}>
                Engine
              </Tabs.Tab>
              <Tabs.Tab value="hex" disabled={selectedHexId === null} leftSection={<Hexagon size={16} />}>
                Hex
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="hex" pt="md" style={{ flex: 1, overflowY: "auto" }}>
              <HexPropertyPanel />
            </Tabs.Panel>

            <Tabs.Panel value="engine" pt="md" style={{ flex: 1, overflowY: "auto" }}>
              <EngineSettingsPanel />
            </Tabs.Panel>
          </Tabs>
        </AppShell.Aside>
      )}

      <AppShell.Main className={classes.main}>
        <EditorGrid />

        {/* Mobile: Sidebar below grid */}
        {isMobile && sidebarOpen && (
          <Paper shadow="sm" p="md" mt="md" w="100%" maw={800} style={{ borderRadius: 8 }}>
            <Tabs value={activeTab} onChange={setActiveTab} orientation="horizontal">
              <Tabs.List>
                <Tabs.Tab value="engine" leftSection={<Settings size={16} />}>
                  Engine
                </Tabs.Tab>
                <Tabs.Tab value="hex" disabled={selectedHexId === null} leftSection={<Hexagon size={16} />}>
                  Hex
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="hex" pt="md">
                <HexPropertyPanel />
              </Tabs.Panel>

              <Tabs.Panel value="engine" pt="md">
                <EngineSettingsPanel />
              </Tabs.Panel>
            </Tabs>
          </Paper>
        )}
      </AppShell.Main>

      {/* Modals */}
      <MyEnginesModal opened={myEnginesOpen} onClose={() => setMyEnginesOpen(false)} onLoadEngine={handleLoadFromCloud} />
      <SaveEngineModal
        opened={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        engine={actions.exportEngine()}
        existingEngineId={cloudEngineId}
        onSaveSuccess={handleCloudSaveSuccess}
      />
    </AppShell>
  );
}

export default HexEditor;
