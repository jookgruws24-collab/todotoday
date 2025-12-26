import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { taskService } from '../services/taskService'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadTasks()
    
    let cleanup = null
    setupRealTimeSubscription().then(fn => {
      cleanup = fn
    })
    
    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  async function loadTasks() {
    try {
      setIsLoading(true)
      const data = await taskService.getTasks()
      setTasks(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function setupRealTimeSubscription() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const subscription = supabase
      .channel('tasks-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task => 
              task.id === payload.new.id ? payload.new : task
            ))
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }

  async function createTask(taskData) {
    try {
      const newTask = await taskService.createTask(taskData)
      // Optimistically add to state immediately
      setTasks(prev => [...prev, newTask])
      return newTask
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  async function updateTask(id, updates) {
    const oldTask = tasks.find(t => t.id === id)
    
    // Optimistic update
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ))

    try {
      const updatedTask = await taskService.updateTask(id, updates)
      return updatedTask
    } catch (err) {
      // Rollback on error
      setTasks(prev => prev.map(task => 
        task.id === id ? oldTask : task
      ))
      setError(err.message)
      throw err
    }
  }

  async function deleteTask(id) {
    const oldTasks = [...tasks]
    
    // Optimistic update
    setTasks(prev => prev.filter(task => task.id !== id))

    try {
      await taskService.deleteTask(id)
    } catch (err) {
      // Rollback on error
      setTasks(oldTasks)
      setError(err.message)
      throw err
    }
  }

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: loadTasks,
  }
}
