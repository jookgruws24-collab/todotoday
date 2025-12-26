import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'

export default function Column({ status, tasks, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const statusTitles = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done',
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] max-w-[400px] p-4 bg-gray-50 rounded-lg ${
        isOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      data-column={status}
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {statusTitles[status]} ({tasks.length})
      </h2>
      
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            {status === 'todo' && 'No tasks yet'}
            {status === 'in-progress' && 'No tasks in progress'}
            {status === 'done' && 'No completed tasks'}
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
