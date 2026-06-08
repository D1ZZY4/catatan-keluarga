import { useCallback, useRef, useState } from "react";

interface DragState {
  dragIndex: number;
  overIndex: number;
}

export function useDragReorder<T>(
  items: T[],
  onReorder: (newItems: T[]) => void,
) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const itemHeightsRef = useRef<number[]>([]);
  const containerRef = useRef<HTMLElement | null>(null);

  const reordered = (() => {
    if (drag === null || drag.dragIndex === drag.overIndex) return items;
    const copy = [...items];
    const [removed] = copy.splice(drag.dragIndex, 1);
    if (removed !== undefined) {
      copy.splice(drag.overIndex, 0, removed);
    }
    return copy;
  })();

  const handlePointerDown = useCallback(
    (index: number) => (e: React.PointerEvent<HTMLElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const container = e.currentTarget.closest("[data-reorder-list]") as HTMLElement | null;
      containerRef.current = container;

      if (container) {
        const children = Array.from(container.children) as HTMLElement[];
        itemHeightsRef.current = children.map((c) => c.getBoundingClientRect().height);
      }

      setDrag({ dragIndex: index, overIndex: index });
    },
    [],
  );

  const handlePointerMove = useCallback(
    (index: number) => (e: React.PointerEvent<HTMLElement>) => {
      if (drag === null || drag.dragIndex !== index) return;

      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const relativeY = e.clientY - containerRect.top;

      const heights = itemHeightsRef.current;
      let cumulative = 0;
      let newOver = heights.length - 1;
      for (let i = 0; i < heights.length; i++) {
        const h = heights[i] ?? 56;
        cumulative += h;
        if (relativeY < cumulative - h / 2) {
          newOver = i;
          break;
        }
      }

      if (newOver !== drag.overIndex) {
        setDrag((d) => (d ? { ...d, overIndex: newOver } : null));
      }
    },
    [drag],
  );

  const handlePointerUp = useCallback(
    (index: number) => (e: React.PointerEvent<HTMLElement>) => {
      if (drag === null || drag.dragIndex !== index) return;
      e.currentTarget.releasePointerCapture(e.pointerId);

      if (drag.dragIndex !== drag.overIndex) {
        onReorder(reordered);
      }
      setDrag(null);
    },
    [drag, onReorder, reordered],
  );

  return {
    reordered,
    drag,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
