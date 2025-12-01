"use client";

import { useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KanbanBoardProps {
  columns: { id: string; title: string }[];
  items: any[];
  onDragEnd: (activeId: string, overId: string) => void;
  renderItem: (item: any) => React.ReactNode;
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 touch-none">
      {children}
    </div>
  );
}

export default function KanbanBoard({ columns, items, onDragEnd, renderItem }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    // If dropped on a container (column)
    if (columns.find(col => col.id === over.id)) {
      onDragEnd(active.id as string, over.id as string);
      return;
    }

    // If dropped on another item
    const overItem = items.find(item => item.id === over.id);
    if (overItem) {
      onDragEnd(active.id as string, overItem.stage); // Assuming 'stage' is the grouping key
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full overflow-x-auto gap-6 pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-80 bg-gray-50/50 rounded-xl border border-gray-200/50 flex flex-col max-h-full">
            <div className="p-4 border-b border-gray-200/50 bg-white/30 backdrop-blur-sm rounded-t-xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">{col.title}</h3>
                <span className="bg-gray-200/50 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                  {items.filter(i => i.stage === col.id).length}
                </span>
              </div>
            </div>
            <div className="p-3 flex-1 overflow-y-auto min-h-[150px]">
              <SortableContext
                id={col.id}
                items={items.filter(i => i.stage === col.id).map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {items
                  .filter((item) => item.stage === col.id)
                  .map((item) => (
                    <SortableItem key={item.id} id={item.id}>
                      {renderItem(item)}
                    </SortableItem>
                  ))}
              </SortableContext>
              {items.filter(i => i.stage === col.id).length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  Drop items here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
