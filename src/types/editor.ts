import type { EngineDefinition, HexNode, Direction, RollDirection, Modifier, NodeStyle } from './engine';
import { DEFAULT_2D6_DIRECTIONS } from '@/constants/engines/shared';

/**
 * Editor mode - what the user is currently doing
 */
export type EditorMode = 
  | 'select'      // Click to select hexes
  | 'paint'       // Click to apply current style
  | 'connect'     // Click two hexes to set a direction connection
  | 'preview';    // Test the engine without editing

/**
 * Tool currently selected in the editor
 */
export type EditorTool = 
  | 'select'
  | 'eraser';

/**
 * A single undoable action in the editor
 */
export interface EditorAction {
  type: 'update-hex' | 'update-engine' | 'update-directions' | 'batch';
  timestamp: number;
  /** Previous state for undo */
  before: Partial<EditorState>;
  /** New state for redo */
  after: Partial<EditorState>;
  /** Human-readable description */
  description: string;
}

/**
 * Draft hex being edited - extends HexNode with validation state
 */
export interface DraftHexNode extends HexNode {
  /** Validation errors for this hex */
  errors?: string[];
  /** Whether this hex has unsaved changes */
  isDirty?: boolean;
}

/**
 * Draft engine being edited - extends EngineDefinition with editor metadata
 */
export interface DraftEngine extends Omit<EngineDefinition, 'nodes'> {
  nodes: DraftHexNode[];
  /** Whether the engine has unsaved changes */
  isDirty: boolean;
  /** When the draft was last modified */
  lastModified: number;
  /** Original engine ID if editing existing */
  sourceEngineId?: string;
  /** Validation errors at engine level */
  errors?: string[];
}

/**
 * Current state of the editor
 */
export interface EditorState {
  /** The engine being edited */
  draft: DraftEngine;
  /** Currently selected hex ID (null if none) */
  selectedHexId: number | null;
  /** Secondary selected hex for connection mode */
  secondaryHexId: number | null;
  /** Current editor mode */
  mode: EditorMode;
  /** Current tool */
  tool: EditorTool;
  /** Current paint color (for paint mode) */
  paintColor: string;
  /** Current paint icon (for paint mode) */
  paintIcon: string;
  /** Current connection direction (for connect mode) */
  connectionDirection: Direction | null;
  /** Undo history */
  undoStack: EditorAction[];
  /** Redo history */
  redoStack: EditorAction[];
  /** Is the editor in a valid state to save */
  isValid: boolean;
  /** Panel visibility states */
  panels: {
    hexProperties: boolean;
    engineSettings: boolean;
  };
}

/**
 * Editor context actions
 */
export interface EditorActions {
  // Selection
  selectHex: (hexId: number | null) => void;
  selectSecondaryHex: (hexId: number | null) => void;
  
  // Mode and tool
  setMode: (mode: EditorMode) => void;
  setTool: (tool: EditorTool) => void;
  
  // Paint settings
  setPaintColor: (color: string) => void;
  setPaintIcon: (icon: string) => void;
  
  // Hex editing
  updateHex: (hexId: number, updates: Partial<HexNode>) => void;
  updateHexStyle: (hexId: number, style: Partial<NodeStyle>) => void;
  updateHexMap: (hexId: number, direction: Direction, targetHexId: number) => void;
  addModifier: (hexId: number, modifier: Modifier) => void;
  removeModifier: (hexId: number, index: number) => void;
  updateModifier: (hexId: number, index: number, modifier: Modifier) => void;
  
  // Engine editing
  updateEngine: (updates: Partial<Omit<EngineDefinition, 'nodes'>>) => void;
  updateDirections: (directions: Record<number, RollDirection>) => void;
  setStartHex: (hexId: number) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Save/Load
  saveDraft: () => void;
  loadDraft: (draftId: string) => void;
  exportEngine: () => EngineDefinition;
  importEngine: (engine: EngineDefinition, name?: string) => void;
  createNew: (name?: string) => void;
  
  // Panel visibility
  togglePanel: (panel: keyof EditorState['panels']) => void;
  
  // Validation
  validate: () => string[];
}

/**
 * Default movement maps for each hex position in the standard hex flower layout.
 * These define where each direction leads from any given hex.
 * 
 * Layout (hex 10 is center, hex 1 at bottom, hex 19 at top):
 * 
 *           19
 *        17    18
 *     14    15    16
 *        12    13
 *      9    10    11
 *         7     8
 *      4     5     6
 *         2     3
 *            1
 * 
 * Cylindrical wrapping:
 * - Left edge wraps to right edge (4↔6, 9↔11, 14↔16)
 * - Top wraps to bottom (moving down from bottom row wraps to top)
 */
export const DEFAULT_HEX_MAPS: Record<number, Record<Direction, number>> = {
  1:  { up: 5,  upRight: 3,  downRight: 3,  down: 1,  downLeft: 2,  upLeft: 2  },
  2:  { up: 7,  upRight: 5,  downRight: 1,  down: 17, downLeft: 11, upLeft: 4  },
  3:  { up: 8,  upRight: 6,  downRight: 9,  down: 18, downLeft: 1,  upLeft: 5  },
  4:  { up: 9,  upRight: 7,  downRight: 2,  down: 14, downLeft: 16, upLeft: 1  },
  5:  { up: 10, upRight: 8,  downRight: 3,  down: 1,  downLeft: 2,  upLeft: 7  },
  6:  { up: 11, upRight: 1,  downRight: 14, down: 16, downLeft: 3,  upLeft: 8  },
  7:  { up: 12, upRight: 10, downRight: 5,  down: 2,  downLeft: 4,  upLeft: 9  },
  8:  { up: 13, upRight: 11, downRight: 6,  down: 3,  downLeft: 5,  upLeft: 10 },
  9:  { up: 14, upRight: 12, downRight: 7,  down: 4,  downLeft: 18, upLeft: 3  },
  10: { up: 15, upRight: 13, downRight: 8,  down: 5,  downLeft: 7,  upLeft: 12 },
  11: { up: 16, upRight: 2,  downRight: 17, down: 6,  downLeft: 8,  upLeft: 13 },
  12: { up: 17, upRight: 15, downRight: 10, down: 7,  downLeft: 9,  upLeft: 14 },
  13: { up: 18, upRight: 16, downRight: 11, down: 8,  downLeft: 10, upLeft: 15 },
  14: { up: 4,  upRight: 17, downRight: 12, down: 9,  downLeft: 19, upLeft: 6  },
  15: { up: 19, upRight: 18, downRight: 13, down: 10, downLeft: 12, upLeft: 17 },
  16: { up: 6,  upRight: 4,  downRight: 19, down: 11, downLeft: 13, upLeft: 18 },
  17: { up: 2,  upRight: 19, downRight: 15, down: 12, downLeft: 14, upLeft: 11 },
  18: { up: 3,  upRight: 9,  downRight: 16, down: 13, downLeft: 15, upLeft: 19 },
  19: { up: 19, upRight: 19, downRight: 18, down: 15, downLeft: 17, upLeft: 19 },
};

/**
 * Create a blank hex node with default values
 */
export function createBlankHexNode(id: number): DraftHexNode {
  // Use proper default movement map for this hex position, fallback to self-reference
  const defaultMap = DEFAULT_HEX_MAPS[id] || {
    up: id,
    upRight: id,
    downRight: id,
    down: id,
    downLeft: id,
    upLeft: id,
  };
  
  return {
    id,
    label: `${id}`,
    map: defaultMap,
  };
}

/**
 * Create a blank engine with default values
 */
export function createBlankEngine(name: string = 'New Engine'): DraftEngine {
  const nodes: DraftHexNode[] = [];
  
  // Create 19 hex nodes with default self-referencing maps
  for (let i = 1; i <= 19; i++) {
    nodes.push(createBlankHexNode(i));
  }
  
  return {
    name,
    description: '',
    icon: 'hexagon',
    roll: '2d6',
    directions: { ...DEFAULT_2D6_DIRECTIONS },
    start: 1,
    nodes,
    isDirty: false,
    lastModified: Date.now(),
  };
}

/**
 * Create initial editor state
 */
export function createInitialEditorState(engine?: EngineDefinition): EditorState {
  const draft: DraftEngine = engine 
    ? {
        ...engine,
        nodes: engine.nodes.map(node => ({ ...node })),
        isDirty: false,
        lastModified: Date.now(),
      }
    : createBlankEngine();

  return {
    draft,
    selectedHexId: null,
    secondaryHexId: null,
    mode: 'select',
    tool: 'select',
    paintColor: '#68f0b0',
    paintIcon: 'hexagon',
    connectionDirection: null,
    undoStack: [],
    redoStack: [],
    isValid: true,
    panels: {
      hexProperties: true,
      engineSettings: true,
    },
  };
}

/**
 * Direction labels for display (includes 'stay' for roll results)
 */
export const DIRECTION_LABELS: Record<RollDirection, string> = {
  up: 'Up',
  upRight: 'Upper Right',
  downRight: 'Lower Right',
  down: 'Down',
  downLeft: 'Lower Left',
  upLeft: 'Upper Left',
  stay: 'Stay',
};

/**
 * Common dice roll options
 */
export const DICE_OPTIONS = [
  { value: '2d6', label: '2d6 (Standard)' },
  { value: '1d6', label: '1d6' },
  { value: '1d8', label: '1d8' },
  { value: '1d10', label: '1d10' },
  { value: '1d12', label: '1d12' },
  { value: '1d20', label: '1d20' },
  { value: '3d6', label: '3d6' },
];

/**
 * Common icon options for hexes
 */
export const ICON_OPTIONS = [
  { value: 'hexagon', label: 'Hexagon' },
  { value: 'circle', label: 'Circle' },
  { value: 'star', label: 'Star' },
  { value: 'home', label: 'Home' },
  { value: 'sun', label: 'Sun' },
  { value: 'moon', label: 'Moon' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'cloud-rain', label: 'Rain' },
  { value: 'cloud-lightning', label: 'Lightning' },
  { value: 'wind', label: 'Wind' },
  { value: 'tornado', label: 'Tornado' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'flame', label: 'Flame' },
  { value: 'droplet', label: 'Droplet' },
  { value: 'skull', label: 'Skull' },
  { value: 'heart', label: 'Heart' },
  { value: 'shield', label: 'Shield' },
  { value: 'sword', label: 'Sword' },
  { value: 'wand', label: 'Wand' },
  { value: 'scroll', label: 'Scroll' },
  { value: 'gem', label: 'Gem' },
  { value: 'crown', label: 'Crown' },
  { value: 'flag', label: 'Flag' },
  { value: 'map-pin', label: 'Map Pin' },
  { value: 'compass', label: 'Compass' },
  { value: 'anchor', label: 'Anchor' },
  { value: 'target', label: 'Target' },
  { value: 'zap', label: 'Zap' },
  { value: 'alert-triangle', label: 'Warning' },
  { value: 'check-circle', label: 'Success' },
  { value: 'x-circle', label: 'Failure' },
];

/**
 * Preset color palettes
 */
export const COLOR_PRESETS = [
  // Neutral
  '#ffffff', '#f0f0f0', '#d0d0d0', '#a0a0a0', '#707070', '#404040', '#202020', '#000000',
  // Primary
  '#ff7777', '#ffaa77', '#ffdd77', '#aaff77', '#77ffaa', '#77ffdd', '#77ddff', '#77aaff',
  '#7777ff', '#aa77ff', '#dd77ff', '#ff77dd', '#ff77aa',
  // Muted
  '#eabcd5', '#ffcf77', '#77bc77', '#87CEEB', '#B0C4DE', '#DDA0DD',
];
