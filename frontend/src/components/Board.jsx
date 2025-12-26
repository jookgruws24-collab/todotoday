import { useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useTasks } from '../hooks/useTasks'
import { useOfflineDetection } from '../hooks/useOfflineDetection'
import { useDragState } from '../hooks/useDragState'
import Column from './Column'
import TaskForm from './TaskForm'
import OfflineIndicator from './OfflineIndicator'

export default function Board() {
  const { tasks, isLoading, error, createTask, updateTask, deleteTask } = useTasks()
  const isOffline = useOfflineDetection()
  const { isDragging, startDrag, endDrag } = useDragState()
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [editingTask, setEditingTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const groupedTasks = {
    'todo': tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    'done': tasks.filter(t => t.status === 'done'),
  }

  function handleDragStart(event) {
    console.log('Drag start:', event)
    if (isOffline) return
    startDrag(event)
  }

  async function handleDragEnd(event) {
    console.log('Drag end:', event)
    const { active, over } = event
    endDrag()
    
    if (!over || isOffline) return
    
    const taskId = active.id
    const newStatus = over.id
    
    console.log('Moving task', taskId, 'to', newStatus)

    const task = tasks.find(t => t.id === taskId)
    if (task && task.status !== newStatus) {
      try {
        await updateTask(taskId, { status: newStatus })
        console.log('Task updated successfully')
      } catch (err) {
        console.error('Failed to update task:', err)
      }
    }
  }

  function handleAddTask() {
    setFormMode('create')
    setEditingTask(null)
    setIsFormOpen(true)
  }

  function handleEditTask(taskId) {
    const task = tasks.find(t => t.id === taskId)
    setFormMode('edit')
    setEditingTask(task)
    setIsFormOpen(true)
  }

  async function handleFormSubmit(taskData) {
    if (formMode === 'create') {
      await createTask(taskData)
    } else if (editingTask) {
      await updateTask(editingTask.id, taskData)
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      await deleteTask(taskId)
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  const taskCount = tasks.length
  const isAtLimit = taskCount >= 100

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading tasks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <OfflineIndicator isOffline={isOffline} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Task Board</h1>
          
          <button
            onClick={handleAddTask}
            disabled={isOffline || isAtLimit}
            title={isAtLimit ? 'Maximum 100 tasks reached. Delete tasks to add more.' : ''}
            className="py-3 px-6 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAtLimit ? `Task Limit Reached (${taskCount}/100)` : `Add Task (${taskCount}/100)`}
          </button>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <Column
              status="todo"
              tasks={groupedTasks['todo']}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
            <Column
              status="in-progress"
              tasks={groupedTasks['in-progress']}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
            <Column
              status="done"
              tasks={groupedTasks['done']}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </div>
        </DndContext>
      </div>

      <TaskForm
        isOpen={isFormOpen}
        mode={formMode}
        initialTask={editingTask}
        onSubmit={handleFormSubmit}
        onClose={() => setIsFormOpen(false)}
        taskCount={taskCount}
      />
    </div>
  )
}
