import { supabase } from './supabase'

export const taskService = {
  /**
   * Fetch all tasks for the authenticated user
   * @returns {Promise<Array>} Array of task objects
   */
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('status')
      .order('position')
    
    if (error) throw error
    return data || []
  },

  /**
   * Create a new task
   * @param {Object} taskData - Task creation data
   * @param {string} taskData.title - Task title (required)
   * @param {string} taskData.description - Task description (optional)
   * @param {string} taskData.status - Initial status (default: 'todo')
   * @returns {Promise<Object>} Created task object
   */
  async createTask({ title, description, status = 'todo' }) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get the max position for the target status
    const { data: maxPosData } = await supabase
      .from('tasks')
      .select('position')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('position', { ascending: false })
      .limit(1)
    
    const nextPosition = maxPosData && maxPosData.length > 0 
      ? maxPosData[0].position + 1 
      : 0

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title,
        description,
        status,
        position: nextPosition,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Update an existing task
   * @param {string} id - Task ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated task object
   */
  async updateTask(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Delete a task
   * @param {string} id - Task ID
   * @returns {Promise<void>}
   */
  async deleteTask(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  /**
   * Get task count for the authenticated user
   * @returns {Promise<number>} Number of tasks
   */
  async getTaskCount() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    if (error) throw error
    return count || 0
  },
}
