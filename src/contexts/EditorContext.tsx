import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";
import type { EngineDefinition, HexNode, Direction, RollDirection, Modifier, NodeStyle } from "@/types/engine";
import type { EditorState, EditorActions, EditorMode, EditorTool, EditorAction, DraftEngine, DraftHexNode } from "@/types/editor";
import { createInitialEditorState, createBlankEngine } from "@/types/editor";

// Action types for the reducer
type Action =
  | { type: "SELECT_HEX"; hexId: number | null }
  | { type: "SELECT_SECONDARY_HEX"; hexId: number | null }
  | { type: "SET_MODE"; mode: EditorMode }
  | { type: "SET_TOOL"; tool: EditorTool }
  | { type: "SET_PAINT_COLOR"; color: string }
  | { type: "SET_PAINT_ICON"; icon: string }
  | { type: "UPDATE_HEX"; hexId: number; updates: Partial<HexNode> }
  | { type: "UPDATE_HEX_STYLE"; hexId: number; style: Partial<NodeStyle> }
  | { type: "UPDATE_HEX_MAP"; hexId: number; direction: Direction; targetHexId: number }
  | { type: "ADD_MODIFIER"; hexId: number; modifier: Modifier }
  | { type: "REMOVE_MODIFIER"; hexId: number; index: number }
  | { type: "UPDATE_MODIFIER"; hexId: number; index: number; modifier: Modifier }
  | { type: "UPDATE_ENGINE"; updates: Partial<Omit<EngineDefinition, "nodes">> }
  | { type: "UPDATE_DIRECTIONS"; directions: Record<number, RollDirection> }
  | { type: "SET_START_HEX"; hexId: number }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "TOGGLE_PANEL"; panel: keyof EditorState["panels"] }
  | { type: "LOAD_ENGINE"; engine: EngineDefinition; name?: string }
  | { type: "CREATE_NEW"; name?: string }
  | { type: "MARK_SAVED" };

// Helper to create an action for undo/redo
function createUndoAction(state: EditorState, description: string, getAfterState: () => Partial<EditorState>): EditorAction {
  return {
    type: "batch",
    timestamp: Date.now(),
    before: { draft: JSON.parse(JSON.stringify(state.draft)) },
    after: getAfterState(),
    description,
  };
}

// Helper to update a hex in the draft
function updateHexInDraft(draft: DraftEngine, hexId: number, updates: Partial<DraftHexNode>): DraftEngine {
  return {
    ...draft,
    isDirty: true,
    lastModified: Date.now(),
    nodes: draft.nodes.map((node) => (node.id === hexId ? { ...node, ...updates, isDirty: true } : node)),
  };
}

// Reducer function
function editorReducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case "SELECT_HEX":
      return {
        ...state,
        selectedHexId: action.hexId,
        secondaryHexId: null,
      };

    case "SELECT_SECONDARY_HEX":
      return {
        ...state,
        secondaryHexId: action.hexId,
      };

    case "SET_MODE":
      return {
        ...state,
        mode: action.mode,
        secondaryHexId: null,
      };

    case "SET_TOOL":
      return {
        ...state,
        tool: action.tool,
      };

    case "SET_PAINT_COLOR":
      return {
        ...state,
        paintColor: action.color,
      };

    case "SET_PAINT_ICON":
      return {
        ...state,
        paintIcon: action.icon,
      };

    case "UPDATE_HEX": {
      const newDraft = updateHexInDraft(state.draft, action.hexId, action.updates);
      return {
        ...state,
        draft: newDraft,
        undoStack: [...state.undoStack, createUndoAction(state, `Update hex ${action.hexId}`, () => ({ draft: newDraft }))],
        redoStack: [],
      };
    }

    case "UPDATE_HEX_STYLE": {
      const hex = state.draft.nodes.find((n) => n.id === action.hexId);
      if (!hex) return state;

      const newStyle = { ...hex.style, ...action.style };
      const newDraft = updateHexInDraft(state.draft, action.hexId, { style: newStyle });
      return {
        ...state,
        draft: newDraft,
        undoStack: [...state.undoStack, createUndoAction(state, `Update hex ${action.hexId} style`, () => ({ draft: newDraft }))],
        redoStack: [],
      };
    }

    case "UPDATE_HEX_MAP": {
      const hex = state.draft.nodes.find((n) => n.id === action.hexId);
      if (!hex) return state;

      const newMap = { ...hex.map, [action.direction]: action.targetHexId };
      const newDraft = updateHexInDraft(state.draft, action.hexId, { map: newMap });
      return {
        ...state,
        draft: newDraft,
        undoStack: [
          ...state.undoStack,
          createUndoAction(state, `Set ${action.direction} from hex ${action.hexId} to ${action.targetHexId}`, () => ({
            draft: newDraft,
          })),
        ],
        redoStack: [],
      };
    }

    case "ADD_MODIFIER": {
      const hex = state.draft.nodes.find((n) => n.id === action.hexId);
      if (!hex) return state;

      const newModifiers = [...(hex.modifiers || []), action.modifier];
      const newDraft = updateHexInDraft(state.draft, action.hexId, { modifiers: newModifiers });
      return {
        ...state,
        draft: newDraft,
        undoStack: [
          ...state.undoStack,
          createUndoAction(state, `Add modifier to hex ${action.hexId}`, () => ({ draft: newDraft })),
        ],
        redoStack: [],
      };
    }

    case "REMOVE_MODIFIER": {
      const hex = state.draft.nodes.find((n) => n.id === action.hexId);
      if (!hex || !hex.modifiers) return state;

      const newModifiers = hex.modifiers.filter((_, i) => i !== action.index);
      const newDraft = updateHexInDraft(state.draft, action.hexId, { modifiers: newModifiers });
      return {
        ...state,
        draft: newDraft,
        undoStack: [
          ...state.undoStack,
          createUndoAction(state, `Remove modifier from hex ${action.hexId}`, () => ({ draft: newDraft })),
        ],
        redoStack: [],
      };
    }

    case "UPDATE_MODIFIER": {
      const hex = state.draft.nodes.find((n) => n.id === action.hexId);
      if (!hex || !hex.modifiers) return state;

      const newModifiers = hex.modifiers.map((m, i) => (i === action.index ? action.modifier : m));
      const newDraft = updateHexInDraft(state.draft, action.hexId, { modifiers: newModifiers });
      return {
        ...state,
        draft: newDraft,
        undoStack: [
          ...state.undoStack,
          createUndoAction(state, `Update modifier on hex ${action.hexId}`, () => ({ draft: newDraft })),
        ],
        redoStack: [],
      };
    }

    case "UPDATE_ENGINE": {
      const newDraft: DraftEngine = {
        ...state.draft,
        ...action.updates,
        isDirty: true,
        lastModified: Date.now(),
      };
      return {
        ...state,
        draft: newDraft,
        undoStack: [...state.undoStack, createUndoAction(state, "Update engine settings", () => ({ draft: newDraft }))],
        redoStack: [],
      };
    }

    case "UPDATE_DIRECTIONS": {
      const newDraft: DraftEngine = {
        ...state.draft,
        directions: action.directions,
        isDirty: true,
        lastModified: Date.now(),
      };
      return {
        ...state,
        draft: newDraft,
        undoStack: [...state.undoStack, createUndoAction(state, "Update direction mapping", () => ({ draft: newDraft }))],
        redoStack: [],
      };
    }

    case "SET_START_HEX": {
      const newDraft: DraftEngine = {
        ...state.draft,
        start: action.hexId,
        isDirty: true,
        lastModified: Date.now(),
      };
      return {
        ...state,
        draft: newDraft,
        undoStack: [...state.undoStack, createUndoAction(state, `Set start hex to ${action.hexId}`, () => ({ draft: newDraft }))],
        redoStack: [],
      };
    }

    case "UNDO": {
      if (state.undoStack.length === 0) return state;

      const lastAction = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        draft: lastAction.before.draft as DraftEngine,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, lastAction],
      };
    }

    case "REDO": {
      if (state.redoStack.length === 0) return state;

      const nextAction = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        draft: nextAction.after.draft as DraftEngine,
        undoStack: [...state.undoStack, nextAction],
        redoStack: state.redoStack.slice(0, -1),
      };
    }

    case "TOGGLE_PANEL":
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.panel]: !state.panels[action.panel],
        },
      };

    case "LOAD_ENGINE": {
      const draft: DraftEngine = {
        ...action.engine,
        name: action.name || action.engine.name,
        nodes: action.engine.nodes.map((node) => ({ ...node })),
        isDirty: false,
        lastModified: Date.now(),
      };
      return {
        ...state,
        draft,
        selectedHexId: null,
        secondaryHexId: null,
        undoStack: [],
        redoStack: [],
      };
    }

    case "CREATE_NEW":
      return {
        ...createInitialEditorState(),
        draft: createBlankEngine(action.name),
      };

    case "MARK_SAVED":
      return {
        ...state,
        draft: {
          ...state.draft,
          isDirty: false,
          nodes: state.draft.nodes.map((node) => ({ ...node, isDirty: false })),
        },
      };

    default:
      return state;
  }
}

// Context
interface EditorContextValue {
  state: EditorState;
  actions: EditorActions;
}

const EditorContext = createContext<EditorContextValue | null>(null);

// Provider component
interface EditorProviderProps {
  children: ReactNode;
  initialEngine?: EngineDefinition;
}

export function EditorProvider({ children, initialEngine }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, createInitialEditorState(initialEngine));

  const actions: EditorActions = {
    selectHex: useCallback((hexId) => dispatch({ type: "SELECT_HEX", hexId }), []),
    selectSecondaryHex: useCallback((hexId) => dispatch({ type: "SELECT_SECONDARY_HEX", hexId }), []),
    setMode: useCallback((mode) => dispatch({ type: "SET_MODE", mode }), []),
    setTool: useCallback((tool) => dispatch({ type: "SET_TOOL", tool }), []),
    setPaintColor: useCallback((color) => dispatch({ type: "SET_PAINT_COLOR", color }), []),
    setPaintIcon: useCallback((icon) => dispatch({ type: "SET_PAINT_ICON", icon }), []),

    updateHex: useCallback((hexId, updates) => dispatch({ type: "UPDATE_HEX", hexId, updates }), []),
    updateHexStyle: useCallback((hexId, style) => dispatch({ type: "UPDATE_HEX_STYLE", hexId, style }), []),
    updateHexMap: useCallback(
      (hexId, direction, targetHexId) => dispatch({ type: "UPDATE_HEX_MAP", hexId, direction, targetHexId }),
      []
    ),
    addModifier: useCallback((hexId, modifier) => dispatch({ type: "ADD_MODIFIER", hexId, modifier }), []),
    removeModifier: useCallback((hexId, index) => dispatch({ type: "REMOVE_MODIFIER", hexId, index }), []),
    updateModifier: useCallback((hexId, index, modifier) => dispatch({ type: "UPDATE_MODIFIER", hexId, index, modifier }), []),

    updateEngine: useCallback((updates) => dispatch({ type: "UPDATE_ENGINE", updates }), []),
    updateDirections: useCallback((directions) => dispatch({ type: "UPDATE_DIRECTIONS", directions }), []),
    setStartHex: useCallback((hexId) => dispatch({ type: "SET_START_HEX", hexId }), []),

    undo: useCallback(() => dispatch({ type: "UNDO" }), []),
    redo: useCallback(() => dispatch({ type: "REDO" }), []),
    canUndo: useCallback(() => state.undoStack.length > 0, [state.undoStack.length]),
    canRedo: useCallback(() => state.redoStack.length > 0, [state.redoStack.length]),

    saveDraft: useCallback(() => {
      // Save to localStorage
      const key = `HEX_FLOWER_EDITOR_DRAFT_${state.draft.name}`;
      localStorage.setItem(key, JSON.stringify(state.draft));
      dispatch({ type: "MARK_SAVED" });
    }, [state.draft]),

    loadDraft: useCallback((draftId) => {
      const key = `HEX_FLOWER_EDITOR_DRAFT_${draftId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const engine = JSON.parse(saved) as DraftEngine;
        dispatch({ type: "LOAD_ENGINE", engine });
      }
    }, []),

    exportEngine: useCallback(() => {
      // Strip editor-specific fields
      const { isDirty, lastModified, sourceEngineId, errors, ...engineDef } = state.draft;
      const nodes = state.draft.nodes.map(({ isDirty, errors, ...node }) => node);
      return { ...engineDef, nodes } as EngineDefinition;
    }, [state.draft]),

    importEngine: useCallback((engine, name) => {
      dispatch({ type: "LOAD_ENGINE", engine, name });
    }, []),

    createNew: useCallback((name) => {
      // Clear any existing draft from localStorage
      if (name) {
        const key = `HEX_FLOWER_EDITOR_DRAFT_${name}`;
        localStorage.removeItem(key);
      }
      dispatch({ type: "CREATE_NEW", name });
    }, []),

    togglePanel: useCallback((panel) => dispatch({ type: "TOGGLE_PANEL", panel }), []),

    validate: useCallback(() => {
      const errors: string[] = [];

      if (!state.draft.name.trim()) {
        errors.push("Engine name is required");
      }

      if (!state.draft.roll.trim()) {
        errors.push("Dice roll expression is required");
      }

      if (state.draft.nodes.length !== 19) {
        errors.push("Engine must have exactly 19 hex nodes");
      }

      // Check that start hex exists
      if (!state.draft.nodes.find((n) => n.id === state.draft.start)) {
        errors.push("Start hex must be a valid hex ID");
      }

      // Check all direction mappings point to valid hexes
      for (const node of state.draft.nodes) {
        for (const [direction, targetId] of Object.entries(node.map)) {
          if (!state.draft.nodes.find((n) => n.id === targetId)) {
            errors.push(`Hex ${node.id}: ${direction} points to invalid hex ${targetId}`);
          }
        }
      }

      return errors;
    }, [state.draft]),
  };

  return <EditorContext.Provider value={{ state, actions }}>{children}</EditorContext.Provider>;
}

// Hook to use the editor context
export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}

// Export the context for advanced use cases
export { EditorContext };
