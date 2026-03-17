import { useState, useEffect } from 'react'
import type { Project, ProjectForm } from './types'
import './App.css'

function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [view, setView] = useState<'list' | 'add'>('list')

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/projects')
      const data: Project[] = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const initialForm: ProjectForm = {
      name: '',
      description: '',
      start: '',
      end: '',
      revenue: 0
    };
  
  const [formData, setFormData] = useState<ProjectForm>(initialForm);

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/projects', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormData(initialForm);
        setView('list')
        fetchProjects()
    }
  }
  catch(error) {
    console.error('Error saving project:', error)
  }
}


  useEffect(() => {
    fetchProjects()
  }, [])

  

  return (
    <div className="App">
      {view === 'list' ? 
      (
        <section>
          <h1>Projects</h1>
          <button onClick={() => setView('add')}>Add New Project</button>
          {projects.length === 0 ? (
            <p>No projects found yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.id}</td>
                    <td>{project.name}</td>
                    <td>{project.description}</td>
                    <td>{new Date(project.start).toLocaleDateString()}</td>
                    <td>{new Date(project.end).toLocaleDateString()}</td>
                    <td>{project.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </section>
      )
      :
      (
        <section>
          <h1>Add New Project</h1>
          <button onClick={() => setView('list')}>Back to List</button>
          <form onSubmit={handleSave}>
            <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
            <input type="date" placeholder="Start Date" value={formData.start} onChange={(e) => setFormData({...formData, start: e.target.value})} required />
            <input type="date" placeholder="End Date" value={formData.end} onChange={(e) => setFormData({...formData, end: e.target.value})} required />
            <input type="number" placeholder="Revenue" value={formData.revenue} onChange={(e) => setFormData({...formData, revenue: parseFloat(e.target.value)})} required />
            <button type="submit">Save</button>
          </form>
        </section>
      )
      }
  

    </div>
  )
}


export default App