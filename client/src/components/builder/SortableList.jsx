import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

function Item({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const handle = (
    <button type="button" aria-label="Drag to reorder" className="cursor-grab touch-none rounded-lg p-1 text-dim hover:bg-raised hover:text-fg active:cursor-grabbing" {...attributes} {...listeners}>
      <GripVertical className="h-4 w-4" />
    </button>
  );
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1, zIndex: isDragging ? 10 : 'auto', position: 'relative' }}>
      {children(handle)}
    </div>
  );
}

// items: array of objects with `id` (or strings when getId is given)
export default function SortableList({ items, onChange, getId = (x) => x.id, children }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const ids = items.map(getId);
  const end = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    onChange(arrayMove(items, ids.indexOf(active.id), ids.indexOf(over.id)));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={end}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {items.map((it, i) => <Item key={getId(it)} id={getId(it)}>{(handle) => children(it, i, handle)}</Item>)}
      </SortableContext>
    </DndContext>
  );
}
