"use client";

import { useState, type ReactNode, useEffect } from "react";
import {
  DndContext,
  useDraggable,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

class MovablePointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: ({ nativeEvent: event }: any, { onActivation }: any) => {
        if (!event.isPrimary || event.button !== 0) return false;

        const isInteractive = (event.target as Element)?.closest(
          'button, input, textarea, select, a, [contenteditable="true"]'
        );

        if (isInteractive) return false;

        onActivation?.({ event });
        return true;
      },
    },
  ];
}

interface MovableDivProps {
  children: ReactNode;
  id?: string;
}

export function MovableDiv({ children, id = "movable-div" }: MovableDivProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const sensors = useSensors(
    useSensor(MovablePointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    setPosition((prev) => ({
      x: prev.x + event.delta.x,
      y: prev.y + event.delta.y,
    }));
  };

  if (!mounted) {
    return <div className="cursor-grab active:cursor-grabbing">{children}</div>;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <DraggableInner id={id} position={position}>
        {children}
      </DraggableInner>
    </DndContext>
  );
}

function DraggableInner({
  children,
  position,
  id,
}: {
  children: ReactNode;
  position: { x: number; y: number };
  id: string;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = {
    transform: CSS.Translate.toString(
      transform
        ? {
            ...transform,
            x: transform.x + position.x,
            y: transform.y + position.y,
          }
        : { x: position.x, y: position.y, scaleX: 1, scaleY: 1 }
    ),
    touchAction: "none" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
}