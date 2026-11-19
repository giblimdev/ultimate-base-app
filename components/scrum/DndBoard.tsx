/*
path :           components/scrum/DndBoard.tsx
tag :            ["scrum", "dnd", "board", "client", "dnd-kit", "sortable",
                  "move", "reorder", "task", "user-story", "epic", "sprint"]
projectId:       <UltimateBaseApp>
type :           component
generic:         true

role:            Board DnD réutilisable pour les 3 flux Scrum (Tasks → US,
                 US → Epics, US → Sprints). Composant client ("use
                 client" justifié par DndContext, SortableContext, les
                 capteurs, useRouter et l'appel aux Server Actions). Gère
                 à la fois le rattachement inter-colonnes (move) et le
                 réordonnancement intra-colonne (reorder) via dnd-kit
                 sortable. Reçoit items, columns, onMove et onReorder ;
                 affiche les items triés par position dans chaque
                 colonne, gère le drag visuel (opacité, curseur) et les
                 erreurs. Après chaque move/reorder réussi, appelle
                 router.refresh() pour recharger les données serveur.

flow:            DndBoard({ items, columns, onMove, onReorder }) →
                 DndContext (PointerSensor + KeyboardSensor) → pour
                 chaque colonne : SortableColumn (useDroppable +
                 SortableContext) → pour chaque item : SortableItem
                 (useSortable) → onDragEnd(event) → si même colonne :
                 onReorder(itemId, newOrder) + router.refresh() ; sinon
                 onMove(itemId, targetColumnId) puis onReorder(itemId,
                 newOrder) + router.refresh().

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
                   "@/app/(app)/scrum/projects/[projectId]/dnd/page.tsx",
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
imports:         ["react", "next/navigation", "@dnd-kit/core",
                  "@dnd-kit/sortable", "@dnd-kit/utilities",
                  "@/components/ui/card"]
exports:         ["DndBoard", "DndItem", "DndColumn"]
useBy:           ["@/app/(app)/scrum/projects/[projectId]/dnd/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux glisser-déposer mes entités entre colonnes",
                  "*en tant qu'utilisateur je veux réordonner mes entités dans une colonne"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
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
  onReorder: (columnId: string, orderedIds: string[]) => Promise<void>;
  disabled?: boolean;
};

function SortableItem({
  item,
  disabled,
}: {
  item: DndItem;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
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

function SortableColumn({
  column,
  items,
  disabled,
}: {
  column: DndColumn;
  items: DndItem[];
  disabled?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const ids = items.map((i) => i.id);

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
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Glissez un élément ici.
            </p>
          ) : (
            items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                disabled={disabled}
              />
            ))
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
}

export function DndBoard({
  items,
  columns,
  onMove,
  onReorder,
  disabled,
}: DndBoardProps) {
  const router = useRouter();
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

  const findItem = (id: string) => items.find((i) => i.id === id);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeItem = findItem(activeId);
    if (!activeItem) return;

    const overItem = findItem(overId);
    const targetColumnId = overItem
      ? overItem.columnId
      : columns.some((c) => c.id === overId)
        ? overId
        : activeItem.columnId;

    // Cas 1a : même colonne → réordonnancement pur
    if (targetColumnId === activeItem.columnId) {
      const columnItems = itemsByColumn.get(activeItem.columnId) ?? [];
      const oldIndex = columnItems.findIndex((i) => i.id === activeId);
      const newIndex = overItem
        ? columnItems.findIndex((i) => i.id === overId)
        : columnItems.length - 1;
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const newOrder = arrayMove(columnItems, oldIndex, newIndex).map(
        (i) => i.id,
      );
      setPending(true);
      setError(null);
      try {
        await onReorder(activeItem.columnId, newOrder);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur DnD.");
      } finally {
        setPending(false);
      }
      return;
    }

    // Cas 1b : colonne différente → move + reorder
    setPending(true);
    setError(null);
    try {
      await onMove(activeId, targetColumnId);
      const targetItems = itemsByColumn.get(targetColumnId) ?? [];
      const insertIndex = overItem
        ? targetItems.findIndex((i) => i.id === overId)
        : targetItems.length;
      const newOrder = [
        ...targetItems.slice(0, insertIndex).map((i) => i.id),
        activeId,
        ...targetItems.slice(insertIndex).map((i) => i.id),
      ];
      await onReorder(targetColumnId, newOrder);
      router.refresh();
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
            <SortableColumn
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