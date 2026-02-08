import { useCallback, useState } from "react";
import {
  Stack,
  Text,
  Switch,
  TextInput,
  Textarea,
  ColorInput,
  Select,
  Button,
  Group,
  Divider,
  Paper,
  ActionIcon,
  ScrollArea,
  Badge,
  Box,
} from "@mantine/core";
import { Trash2, Plus, Home, Image, X } from "lucide-react";
import { useEditor } from "@/contexts/EditorContext";
import { DIRECTIONS, type Direction } from "@/types/engine";
import { COLOR_PRESETS, DIRECTION_LABELS } from "@/types/editor";
import { IconPickerModal } from "./IconPickerModal";
import { HexIcon } from "@/components/HexIcon";

export function HexPropertyPanel() {
  const { state, actions } = useEditor();
  const { draft, selectedHexId } = state;
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const selectedHex = selectedHexId !== null ? draft.nodes.find((n) => n.id === selectedHexId) : null;

  const handleLabelChange = useCallback(
    (value: string) => {
      if (selectedHexId !== null) {
        actions.updateHex(selectedHexId, { label: value });
      }
    },
    [selectedHexId, actions]
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      if (selectedHexId !== null) {
        actions.updateHex(selectedHexId, { description: value });
      }
    },
    [selectedHexId, actions]
  );

  const handleColorChange = useCallback(
    (value: string) => {
      if (selectedHexId !== null) {
        actions.updateHexStyle(selectedHexId, { backgroundColor: value });
      }
    },
    [selectedHexId, actions]
  );

  const handleTextColorChange = useCallback(
    (value: string) => {
      if (selectedHexId !== null) {
        actions.updateHexStyle(selectedHexId, { textColor: value });
      }
    },
    [selectedHexId, actions]
  );

  const handleIconChange = useCallback(
    (value: string | null) => {
      if (selectedHexId !== null) {
        actions.updateHexStyle(selectedHexId, { icon: value || undefined });
      }
    },
    [selectedHexId, actions]
  );

  const handleDirectionChange = useCallback(
    (direction: Direction, targetId: string | null) => {
      if (selectedHexId !== null && targetId) {
        actions.updateHexMap(selectedHexId, direction, parseInt(targetId, 10));
      }
    },
    [selectedHexId, actions]
  );

  const handleAddModifier = useCallback(() => {
    if (selectedHexId !== null) {
      actions.addModifier(selectedHexId, { key: "New Key", value: "Value" });
    }
  }, [selectedHexId, actions]);

  const handleRemoveModifier = useCallback(
    (index: number) => {
      if (selectedHexId !== null) {
        actions.removeModifier(selectedHexId, index);
      }
    },
    [selectedHexId, actions]
  );

  const handleModifierChange = useCallback(
    (index: number, key: string, value: string) => {
      if (selectedHexId !== null) {
        actions.updateModifier(selectedHexId, index, { key, value });
      }
    },
    [selectedHexId, actions]
  );

  const handleSetStart = useCallback(() => {
    if (selectedHexId !== null) {
      actions.setStartHex(selectedHexId);
    }
  }, [selectedHexId, actions]);

  const handleDeselect = useCallback(() => {
    actions.selectHex(null);
  }, [actions]);

  // Generate hex options for direction selects
  const hexOptions = draft.nodes.map((n) => ({
    value: String(n.id),
    label: n.label || `Hex ${n.id}`,
  }));

  if (!selectedHex) {
    return (
      <Stack>
        <Text size="lg" fw={600}>
          Hex Properties
        </Text>
        <Text c="dimmed" size="sm">
          Select a hex to edit its properties
        </Text>
      </Stack>
    );
  }

  const isStartHex = selectedHex.id === draft.start;

  return (
    <ScrollArea h="calc(100vh - 120px)" offsetScrollbars>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={600}>
            Hex {selectedHex.id}
          </Text>
          <ActionIcon variant="subtle" color="gray" onClick={handleDeselect} aria-label="Close hex properties">
            <X size={18} />
          </ActionIcon>
        </Group>

        <Group justify="space-between">
          {isStartHex ? (
            <Badge color="green" leftSection={<Home size={12} />}>
              Start Hex
            </Badge>
          ) : (
            <Button size="xs" variant="light" leftSection={<Home size={14} />} onClick={handleSetStart}>
              Set as Start
            </Button>
          )}
        </Group>

        <Divider label="Basic Info" labelPosition="left" />

        <TextInput
          label="Label"
          placeholder="Enter hex label"
          value={selectedHex.label || ""}
          onChange={(e) => handleLabelChange(e.currentTarget.value)}
        />

        <Textarea
          label="Description"
          placeholder="Enter hex description"
          value={selectedHex.description || ""}
          onChange={(e) => handleDescriptionChange(e.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={4}
        />

        <Divider label="Appearance" labelPosition="left" />

        <ColorInput
          label="Background Color"
          value={selectedHex.style?.backgroundColor || "#ccc"}
          onChange={handleColorChange}
          swatches={COLOR_PRESETS}
          swatchesPerRow={8}
        />

        <ColorInput
          label="Text Color"
          value={selectedHex.style?.textColor || "#000000"}
          onChange={handleTextColorChange}
          swatches={["#000000", "#ffffff", "#333333", "#666666", "#999999", "#cccccc", "#ff0000", "#0000ff"]}
          swatchesPerRow={8}
        />

        <Group justify="space-between" align="center">
          <Text size="sm">Render blank</Text>
          <Switch
            checked={!!selectedHex.blank}
            onChange={(e) => actions.updateHex(selectedHex.id, { blank: e.currentTarget.checked })}
            aria-label="Render hex blank"
          />
        </Group>

        <Box>
          <Text size="sm" fw={500} mb={4}>
            Icon
          </Text>
          <Button
            variant="light"
            fullWidth
            justify="space-between"
            leftSection={selectedHex.style?.icon ? <HexIcon icon={selectedHex.style.icon} size={18} /> : <Image size={18} />}
            onClick={() => setIconPickerOpen(true)}
          >
            {selectedHex.style?.icon || "Select an icon..."}
          </Button>
        </Box>

        <IconPickerModal
          opened={iconPickerOpen}
          onClose={() => setIconPickerOpen(false)}
          onSelect={handleIconChange}
          currentIcon={selectedHex.style?.icon}
        />

        <Divider label="Movement" labelPosition="left" />

        <Text size="sm" c="dimmed">
          Set where each direction leads from this hex
        </Text>

        <Stack gap="xs">
          {DIRECTIONS.map((direction) => (
            <Group key={direction} gap="xs">
              <Text size="sm" w={100}>
                {DIRECTION_LABELS[direction]}
              </Text>
              <Select
                size="xs"
                style={{ flex: 1 }}
                value={String(selectedHex.map[direction])}
                onChange={(value) => handleDirectionChange(direction, value)}
                data={hexOptions}
              />
            </Group>
          ))}
          {/* Show Stay row if engine has a stay direction configured */}
          {Object.values(draft.directions).includes("stay") && (
            <Group gap="xs">
              <Text size="sm" w={100}>
                {DIRECTION_LABELS["stay"]}
              </Text>
              <Select size="xs" style={{ flex: 1 }} value={String(selectedHexId)} disabled data={hexOptions} />
            </Group>
          )}
        </Stack>

        <Divider label="Modifiers" labelPosition="left" />

        <Text size="sm" c="dimmed">
          Add game mechanics or effects
        </Text>

        <Stack gap="xs">
          {selectedHex.modifiers?.map((modifier, index) => (
            <Paper key={index} p="xs" withBorder>
              <Group gap="xs" align="flex-end">
                <TextInput
                  size="xs"
                  label="Key"
                  value={modifier.key}
                  onChange={(e) => handleModifierChange(index, e.currentTarget.value, modifier.value)}
                  style={{ flex: 1 }}
                />
                <TextInput
                  size="xs"
                  label="Value"
                  value={modifier.value}
                  onChange={(e) => handleModifierChange(index, modifier.key, e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveModifier(index)}>
                  <Trash2 size={16} />
                </ActionIcon>
              </Group>
            </Paper>
          ))}
        </Stack>

        <Button variant="light" leftSection={<Plus size={16} />} onClick={handleAddModifier}>
          Add Modifier
        </Button>
      </Stack>
    </ScrollArea>
  );
}

export default HexPropertyPanel;
