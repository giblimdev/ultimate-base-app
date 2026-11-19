/*
path :           components/scrum/DndBoard.tsx
tag :            ["scrum", "dnd", "board", "client", "dnd-kit", "move",
                  "task", "user-story", "epic", "sprint"]
projectId:       <UltimateBaseApp>
type:            component
generic:         true

role:            Board DnD réutilisable pour les 3 flux Scrum : Tasks →
                 US, US → Epics, US → Sprints. Composant client ("use
                 client" justifié par DndContext, les capteurs et
                 l'appel aux Server Actions). Reçoit une liste de
                 draggables (items), une liste de droppables (colonnes),
                 et un callback onMove(itemId, targetId) qui appelle la
                 Server Action correspondante. Affiche les items dans
                 leurs colonnes, gère le drag visuel (opacité, curseur),
                 et affiche l'erreur en cas d'échec. Mobile first
                 (dnd-kit supporte le tactile via PointerSensor).

flow:            DndBoard({ items, columns, itemLabel, columnLabel,
                 onMove }) → DndContext (PointerSensor + KeyboardSensor)
                 → pour chaque colonne : DroppableColumn (useDroppable)
                 avec SortableContext → pour chaque item : DraggableItem
                 (useDraggable) → onDragEnd(event) → resolve targetId
                 (event.over?.id) → onMove(itemId, targetId) → refresh.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/actions/dnd.ts",
                   "@/app/(app)/scrum/actions/epic.ts",
                   "@/app/(app)/scrum/actions/feature.ts",
                   "@/app/(app)/scrum/actions/persona.ts",
                   "@/app/(app)/scrum/actions/project.ts",
                   "@/app/(app)/scrum/actions/sprint.ts",
                   "@/app/(app)/scrum/actions/task.ts",
                   "@/app/(app)/scrum/actions/us.ts",
                   "@/app/(app)/scrum/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/edit/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/epics/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/features/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/personas/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/project-detail-content.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/sprints/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/tasks/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/us/page.tsx",
                   "@/app/(app)/scrum/projects/new/page.tsx",
                   "@/app/(app)/scrum/projects/page.tsx",
                   "@/components/scrum/DndBoard.tsx",
                   "@/components/scrum/EpicBoard.tsx",
                   "@/components/scrum/FeatureBoard.tsx",
                   "@/components/scrum/JsonEditor.tsx",
                   "@/components/scrum/PersonaBoard.tsx",
                   "@/components/scrum/ProjectForm.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/components/scrum/SprintBoard.tsx",
                   "@/components/scrum/TaskBoard.tsx",
                   "@/components/scrum/UserStoryBoard.tsx",
                   "@/lib/scrum/access.ts",
                   "@/lib/scrum/defaults.ts",
                   "@/lib/scrum/json-io.ts",
                   "@/lib/scrum/mutations.ts",
                   "@/lib/scrum/queries.ts",
                   "@/lib/scrum/schema.ts",
                   "@/lib/scrum/types.ts",
                 ]
relatedFiles:    ["@/app/(app)/scrum/actions/dnd.ts"]
imports:         ["react", "@dnd-kit/core", "@dnd-kit/utilities",
                  "@/components/ui/card"]
exports:         ["DndBoard", "DndItem", "DndColumn"]
useBy:           ["@/app/(app)/scrum/projects/[projectId]/tasks/page.tsx",
                  "@/app/(app)/scrum/projects/[projectId]/us/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux glisser-déposer mes entités entre colonnes"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
"use client";

import * as React from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type DndItem = {
  id: string;
  label: string;
  description?: string;
  columnId: string;
};

export type DndColumn = {
  id: string;
  label: string;
};

type DndBoardProps = {
  items: DndItem[];
  columns: DndColumn[];
  onMove: (itemId: string, targetColumnId: string) => Promise<void>;
  disabled?: boolean;
};

function DraggableItem({
  item,
  disabled,
}: {
  item: DndItem;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
    cursor: disabled ? "default" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="rounded-md border border-border bg-card p-2 text-sm shadow-sm"
    >
      <div className="font-medium">{item.label}</div>
      {item.description && (
        <div className="text-xs text-muted-foreground">{item.description}</div>
      )}
    </div>
  );
}

function DroppableColumn({
  column,
  items,
  disabled,
}: {
  column: DndColumn;
  items: DndItem[];
  disabled?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <Card
      ref={setNodeRef}
      className={`min-h-32 transition-colors ${
        isOver ? "ring-2 ring-primary" : ""
      }`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{column.label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Glissez un élément ici.
          </p>
        ) : (
          items.map((item) => (
            <DraggableItem key={item.id} item={item} disabled={disabled} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function DndBoard({
  items,
  columns,
  onMove,
  disabled,
}: DndBoardProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  const itemsByColumn = React.useMemo(() => {
    const map = new Map<string, DndItem[]>();
    for (const col of columns) map.set(col.id, []);
    for (const item of items) {
      const arr = map.get(item.columnId) ?? [];
      arr.push(item);
      map.set(item.columnId, arr);
    }
    return map;
  }, [items, columns]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const itemId = String(active.id);
    const targetColumnId = String(over.id);
    const item = items.find((i) => i.id === itemId);
    if (!item || item.columnId === targetColumnId) return;

    setPending(true);
    setError(null);
    try {
      await onMove(itemId, targetColumnId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur DnD.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
          {error}
        </div>
      )}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {columns.map((col) => (
            <DroppableColumn
              key={col.id}
              column={col}
              items={itemsByColumn.get(col.id) ?? []}
              disabled={disabled || pending}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}