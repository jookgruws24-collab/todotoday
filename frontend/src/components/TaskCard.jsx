import { useDraggable } from '@dnd-kit/core'
import { truncate } from '../utils/truncate'

export default function TaskCard({ task, onEdit, onDelete, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, isDragging: dragging } = useDraggable({
    id: task.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: dragging ? 0.5 : 1,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-700 p-4 rounded-md shadow-lg hover:shadow-xl transition-shadow border border-slate-600"
      data-task-id={task.id}
    >
      <div 
        {...listeners} 
        {...attributes} 
        className="cursor-grab active:cursor-grabbing pb-3 select-none"
      >
        <h3
          className="text-lg font-semibold truncate mb-2 text-white"
          title={task.title}
        >
          {task.title}
        </h3>

        {task.description && (
          <p
            className="text-sm text-gray-300 line-clamp-3"
            title={task.description}
          >
            {truncate(task.description, 150)}
          </p>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(task.id)
          }}
          className="py-2 px-4 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm('Are you sure you want to delete this task?')) {
              onDelete(task.id)
            }
          }}
          className="py-2 px-4 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
