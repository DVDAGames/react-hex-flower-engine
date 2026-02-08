import { useCallback, useState } from "react";
import { Stack, Text, TextInput, Textarea, Select, Divider, ScrollArea, Table, Badge, Button, Box } from "@mantine/core";
import { Image } from "lucide-react";
import { useEditor } from "@/contexts/EditorContext";
import type { RollDirection } from "@/types/engine";
import { ROLL_DIRECTIONS } from "@/types/engine";
import { DICE_OPTIONS, DIRECTION_LABELS } from "@/types/editor";
import { IconPickerModal } from "./IconPickerModal";
import { HexIcon } from "@/components/HexIcon";

export function EngineSettingsPanel() {
  const { state, actions } = useEditor();
  const { draft } = state;
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const handleNameChange = useCallback(
    (value: string) => {
      actions.updateEngine({ name: value });
    },
    [actions]
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      actions.updateEngine({ description: value });
    },
    [actions]
  );

  const handleIconChange = useCallback(
    (value: string | null) => {
      actions.updateEngine({ icon: value || undefined });
    },
    [actions]
  );

  const handleRollChange = useCallback(
    (value: string | null) => {
      if (value) {
        actions.updateEngine({ roll: value });
      }
    },
    [actions]
  );

  const handleDirectionChange = useCallback(
    (rollValue: number, direction: RollDirection | null) => {
      if (direction) {
        const newDirections = { ...draft.directions, [rollValue]: direction };
        actions.updateDirections(newDirections);
      }
    },
    [actions, draft.directions]
  );

  // Get the range of possible roll values based on the dice expression
  const getRollRange = (roll: string): number[] => {
    const match = roll.match(/^(\d+)d(\d+)$/);
    if (!match) return [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Default 2d6 range

    const numDice = parseInt(match[1], 10);
    const dieSize = parseInt(match[2], 10);
    const min = numDice;
    const max = numDice * dieSize;

    const range: number[] = [];
    for (let i = min; i <= max; i++) {
      range.push(i);
    }
    return range;
  };

  const rollRange = getRollRange(draft.roll);

  const directionOptions = ROLL_DIRECTIONS.map((d) => ({
    value: d,
    label: DIRECTION_LABELS[d],
  }));

  // Calculate validation
  const validationErrors = actions.validate();

  return (
    <ScrollArea h="calc(100vh - 120px)" offsetScrollbars>
      <Stack gap="md">
        <Text size="lg" fw={600}>
          Engine Settings
        </Text>

        {validationErrors.length > 0 && (
          <Stack gap="xs">
            {validationErrors.map((error, i) => (
              <Badge key={i} color="red" variant="light" size="sm">
                {error}
              </Badge>
            ))}
          </Stack>
        )}

        <Divider label="General" labelPosition="left" />

        <TextInput
          label="Engine Name"
          placeholder="Enter engine name"
          value={draft.name}
          onChange={(e) => handleNameChange(e.currentTarget.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Describe your hex flower engine"
          value={draft.description || ""}
          onChange={(e) => handleDescriptionChange(e.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={4}
        />

        <Box>
          <Text size="sm" fw={500} mb={4}>
            Engine Icon
          </Text>
          <Button
            variant="light"
            fullWidth
            justify="space-between"
            leftSection={draft.icon ? <HexIcon icon={draft.icon} size={18} /> : <Image size={18} />}
            onClick={() => setIconPickerOpen(true)}
          >
            {draft.icon || "Select an icon..."}
          </Button>
        </Box>

        <IconPickerModal
          opened={iconPickerOpen}
          onClose={() => setIconPickerOpen(false)}
          onSelect={handleIconChange}
          currentIcon={draft.icon}
        />

        <Divider label="Dice & Directions" labelPosition="left" />

        <Select
          label="Dice Roll"
          description="(Coming Soon) The dice rolled to determine movement"
          value={draft.roll}
          onChange={handleRollChange}
          data={DICE_OPTIONS}
          disabled
        />

        <Text size="sm" fw={500}>
          Direction Mapping
        </Text>
        <Text size="xs" c="dimmed">
          Map each roll result to a movement direction
        </Text>

        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Roll</Table.Th>
              <Table.Th>Direction</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rollRange.map((rollValue) => (
              <Table.Tr key={rollValue}>
                <Table.Td>
                  <Badge variant="light">{rollValue}</Badge>
                </Table.Td>
                <Table.Td>
                  <Select
                    size="xs"
                    value={draft.directions[rollValue] || null}
                    onChange={(value) => handleDirectionChange(rollValue, value as RollDirection)}
                    data={directionOptions}
                    placeholder="Select direction"
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Divider label="Start Position" labelPosition="left" />

        <Select
          label="Starting Hex"
          description="The hex where the token begins"
          value={String(draft.start)}
          onChange={(value) => value && actions.setStartHex(parseInt(value, 10))}
          data={draft.nodes.map((n) => ({
            value: String(n.id),
            label: n.label || `Hex ${n.id}`,
          }))}
        />
      </Stack>
    </ScrollArea>
  );
}

export default EngineSettingsPanel;
