import { useCallback, useState } from "react";
import { AppShell, Group, ActionIcon, Tooltip, Badge, Divider, Text } from "@mantine/core";
import {
  Undo2,
  Redo2,
  Save,
  Download,
  Upload,
  FilePlus,
  PanelLeft,
  PanelRight,
  Play,
  Eye,
  Cloud,
  FolderOpen,
} from "lucide-react";
import { useEditor } from "@/contexts/EditorContext";
import { useAuth } from "@/contexts";
import { EditorGrid } from "./EditorGrid";
import { HexPropertyPanel } from "./HexPropertyPanel";
import { EngineSettingsPanel } from "./EngineSettingsPanel";
import { MyEnginesModal } from "./MyEnginesModal";
import { SaveEngineModal } from "./SaveEngineModal";
import { Footer } from "@/components/Footer";

import type { EngineDefinition } from "@/types/engine";
import classes from "./HexEditor.module.css";

export function HexEditor() {
  const { state, actions } = useEditor();
  const { isAuthenticated } = useAuth();
  const { draft, mode, panels } = state;

  // Modal states
  const [myEnginesOpen, setMyEnginesOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [cloudEngineId, setCloudEngineId] = useState<string | null>(draft.sourceEngineId || null);

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
    [actions]
  );

  const handleCloudSaveSuccess = useCallback(
    (engineId: string) => {
      setCloudEngineId(engineId);
      actions.saveDraft(); // Also save locally and mark as clean
    },
    [actions]
  );

  return (
    <AppShell
      className={classes.editorShell}
      header={{ height: 60 }}
      navbar={{
        width: panels.hexProperties ? 320 : 0,
        breakpoint: "sm",
        collapsed: { mobile: !panels.hexProperties, desktop: !panels.hexProperties },
      }}
      aside={{
        width: panels.engineSettings ? 320 : 0,
        breakpoint: "sm",
        collapsed: { mobile: !panels.engineSettings, desktop: !panels.engineSettings },
      }}
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

            {/* Panel toggles */}
            <Tooltip label="Hex Properties">
              <ActionIcon
                variant={panels.hexProperties ? "filled" : "subtle"}
                onClick={() => actions.togglePanel("hexProperties")}
              >
                <PanelLeft size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Engine Settings">
              <ActionIcon
                variant={panels.engineSettings ? "filled" : "subtle"}
                onClick={() => actions.togglePanel("engineSettings")}
              >
                <PanelRight size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      {panels.hexProperties && (
        <AppShell.Navbar p="md" className={classes.panel}>
          <HexPropertyPanel />
        </AppShell.Navbar>
      )}

      {panels.engineSettings && (
        <AppShell.Aside p="md" className={classes.panel}>
          <EngineSettingsPanel />
        </AppShell.Aside>
      )}

      <AppShell.Main className={classes.main}>
        <EditorGrid />
        <Footer />
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
